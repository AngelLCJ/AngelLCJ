// Runs ONLY on Ángel's machine: it is the one piece of code that reads the private
// work repo, and it writes nothing but aggregate numbers.
import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { PATHS } from "../config";
import type { Stats } from "../types";
import { buildStats, dayWindow, daysAgo } from "./aggregate";

const run = promisify(execFile);
const DEFAULT_AUTHOR = "AngelLCJ";

export interface RefreshDeps {
  search: (query: string) => Promise<number>;
  now: Date;
  repo: string;
  author: string;
  out: string;
}

export async function refresh({ search, now, repo, author, out }: RefreshDeps): Promise<Stats> {
  const base = `repo:${repo} is:pr author:${author}`;
  const authored = await search(base);
  const merged = await search(`${base} is:merged`);
  const merged30d = await search(`${base} is:merged merged:>=${daysAgo(now, 30)}`);
  const daily7: number[] = [];
  for (const day of dayWindow(now)) {
    daily7.push(await search(`${base} is:merged merged:${day}`));
  }
  const stats = buildStats({ authored, merged, merged30d, daily7 }, now);
  writeFileSync(out, `${JSON.stringify(stats, null, 2)}\n`);
  return stats;
}

async function ghSearchCount(query: string): Promise<number> {
  const { stdout } = await run("gh", ["api", "-X", "GET", "search/issues", "-f", `q=${query}`, "--jq", ".total_count"]);
  const n = Number(stdout.trim());
  if (!Number.isFinite(n)) throw new Error("gh search returned a non-numeric count");
  return n;
}

async function main(): Promise<void> {
  const repo = process.env.TOWER_WORK_REPO;
  if (!repo) {
    console.error("TOWER_WORK_REPO is required");
    process.exit(1);
  }
  const stats = await refresh({
    search: ghSearchCount,
    now: new Date(),
    repo,
    author: process.env.TOWER_AUTHOR ?? DEFAULT_AUTHOR,
    out: PATHS.stats,
  });
  console.log(`stats refreshed: ${stats.prsMerged} merged, ${stats.merged30d} in 30 days`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err: unknown) => {
    console.error(`refresh-stats failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
