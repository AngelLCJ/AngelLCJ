// Landing flow, split so a visitor is only answered after the radar was published:
//   --sweep   record every open landing issue, save the pending replies
//   (workflow builds, tests, commits and pushes)
//   --reply   answer, close and lock those issues
//   --prune   drop stored logins whose account no longer exists
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadLandings, PATHS } from "../config";
import type { Landing } from "../types";
import * as gh from "./github";
import { addLanding, MAX_LANDINGS, MIN_ACCOUNT_AGE_DAYS, OWNER, pruneDeleted, validateLogin } from "./landings";

const DAY_MS = 86_400_000;

export type IssueOutcome = "added" | "duplicate" | "owner" | "invalid" | "too-new";

export interface LandingIssue {
  number: number;
  // title/body may be present on the payload but are deliberately never read.
  title?: string;
  body?: string | null;
  user: { login: string };
}

export interface Reply {
  number: number;
  login: string;
  outcome: IssueOutcome;
}

export interface SweepDeps {
  issues: LandingIssue[];
  getUser: (login: string) => Promise<{ created_at: string } | null>;
  now: Date;
  readList: () => Landing[];
  writeList: (list: Landing[]) => void;
}

const REFUSED = "🛬 Tower: landing request logged, but this flight can't be shown on the radar.";

function replyText({ outcome, login }: Reply): string {
  if (outcome === "added") return `🛬 Tower to @${login}: cleared to land. You're on the radar.`;
  if (outcome === "duplicate") return `🛬 Tower to @${login}: you're already on the radar. Welcome back.`;
  return REFUSED;
}

async function isOldEnough(d: SweepDeps, login: string): Promise<boolean | null> {
  const user = await d.getUser(login);
  if (!user) return null;
  return d.now.getTime() - Date.parse(user.created_at) >= MIN_ACCOUNT_AGE_DAYS * DAY_MS;
}

export async function sweepLandings(d: SweepDeps): Promise<Reply[]> {
  let list = d.readList();
  let changed = false;
  const replies: Reply[] = [];
  for (const { number, user } of d.issues) {
    const login = user.login;
    const age = validateLogin(login) ? await isOldEnough(d, login) : null;
    if (age === null || age === false) {
      replies.push({ number, login, outcome: age === null ? "invalid" : "too-new" });
      continue;
    }
    const result = addLanding(list, login, d.now, { owner: OWNER, max: MAX_LANDINGS });
    if (result.outcome === "added") {
      list = result.list;
      changed = true;
    }
    replies.push({ number, login, outcome: result.outcome });
  }
  if (changed) d.writeList(list);
  return replies;
}

export async function sendReplies(
  replies: Reply[],
  api: { comment: (issue: number, body: string) => Promise<void>; closeAndLock: (issue: number) => Promise<void> },
): Promise<void> {
  for (const r of replies) {
    try {
      await api.comment(r.number, replyText(r));
    } finally {
      await api.closeAndLock(r.number);
    }
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

const writeLandings = (list: Landing[]) => writeFileSync(PATHS.landings, `${JSON.stringify(list, null, 2)}\n`);
const repliesFile = () => join(process.env.RUNNER_TEMP ?? ".", "landing-replies.json");

async function main(): Promise<void> {
  const token = requireEnv("GITHUB_TOKEN");
  const repo = requireEnv("GITHUB_REPOSITORY");
  const mode = process.argv[2];
  if (mode === "--prune") {
    writeLandings(await pruneDeleted(loadLandings(), (l) => gh.userExists(token, l)));
  } else if (mode === "--sweep") {
    const replies = await sweepLandings({
      issues: await gh.listOpenLandings(token, repo),
      getUser: (l) => gh.getUser(token, l),
      now: new Date(),
      readList: () => loadLandings(),
      writeList: writeLandings,
    });
    writeFileSync(repliesFile(), JSON.stringify(replies));
    console.log(`landings swept: ${replies.map((r) => r.outcome).join(", ") || "none pending"}`);
  } else if (mode === "--reply") {
    const replies = JSON.parse(readFileSync(repliesFile(), "utf8")) as Reply[];
    await sendReplies(replies, {
      comment: (n, body) => gh.comment(token, repo, n, body),
      closeAndLock: (n) => gh.closeAndLock(token, repo, n),
    });
  } else {
    throw new Error("usage: handle-issue.ts --sweep | --reply | --prune");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err: unknown) => {
    console.error(`landing failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
