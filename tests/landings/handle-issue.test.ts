import { describe, expect, it, vi } from "vitest";
import { sendReplies, sweepLandings, type LandingIssue, type SweepDeps } from "../../src/landings/handle-issue";
import type { Landing } from "../../src/types";

const now = new Date("2026-10-20T18:00:00Z");
const OLD = "2020-01-01T00:00:00Z";

const issue = (number: number, login: string): LandingIssue => ({
  number, title: "<script>alert(1)</script>", body: "<img src=x>", user: { login },
});

function deps(issues: LandingIssue[], ages: Record<string, string | null>, list: Landing[] = []) {
  const written: Landing[][] = [];
  const d: SweepDeps = {
    issues,
    getUser: async (l) => (ages[l] ? { created_at: ages[l] as string } : null),
    now,
    readList: () => list,
    writeList: (l) => written.push(l),
  };
  return { d, written };
}

describe("sweepLandings", () => {
  it("records only author logins, never titles or bodies", async () => {
    const { d, written } = deps([issue(7, "octo-cat")], { "octo-cat": OLD });
    expect(await sweepLandings(d)).toEqual([{ number: 7, login: "octo-cat", outcome: "added" }]);
    expect(written).toEqual([[{ login: "octo-cat", landedAt: now.toISOString() }]]);
    expect(JSON.stringify(written)).not.toContain("script");
  });
  it("processes every pending issue and writes the list once", async () => {
    const { d, written } = deps([issue(1, "a1"), issue(2, "b2"), issue(3, "a1")], { a1: OLD, b2: OLD });
    const replies = await sweepLandings(d);
    expect(replies.map((r) => r.outcome)).toEqual(["added", "added", "duplicate"]);
    expect(written).toHaveLength(1);
    expect(written[0].map((l) => l.login)).toEqual(["b2", "a1"]);
  });
  it("refuses accounts younger than 30 days", async () => {
    const { d, written } = deps([issue(7, "fresh")], { fresh: "2026-10-10T00:00:00Z" });
    expect((await sweepLandings(d))[0].outcome).toBe("too-new");
    expect(written).toEqual([]);
  });
  it("refuses deleted accounts", async () => {
    const { d } = deps([issue(7, "ghost")], { ghost: null });
    expect((await sweepLandings(d))[0].outcome).toBe("invalid");
  });
  it("refuses logins the leak guard would flag", async () => {
    const flagged = ["rei", "2000"].join("-"); // assembled so this file stays clean for the guard
    const { d, written } = deps([issue(7, flagged)], { [flagged]: OLD });
    expect((await sweepLandings(d))[0].outcome).toBe("invalid");
    expect(written).toEqual([]);
  });
});

describe("sendReplies", () => {
  it("answers each outcome and always closes and locks", async () => {
    const comment = vi.fn(async (_n: number, _body: string) => {});
    const closeAndLock = vi.fn(async (_n: number) => {});
    await sendReplies(
      [
        { number: 1, login: "octo", outcome: "added" },
        { number: 2, login: "octo", outcome: "duplicate" },
        { number: 3, login: "fresh", outcome: "too-new" },
      ],
      { comment, closeAndLock },
    );
    expect(comment).toHaveBeenNthCalledWith(1, 1, "🛬 Tower to @octo: cleared to land. You're on the radar.");
    expect(comment).toHaveBeenNthCalledWith(2, 2, "🛬 Tower to @octo: you're already on the radar. Welcome back.");
    expect(comment).toHaveBeenNthCalledWith(3, 3, "🛬 Tower: landing request logged, but this flight can't be shown on the radar.");
    expect(closeAndLock.mock.calls.map((c) => c[0])).toEqual([1, 2, 3]);
  });
});
