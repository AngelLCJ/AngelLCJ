import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadStats } from "../../src/config";
import { refresh } from "../../src/stats/refresh";

describe("refresh", () => {
  it("writes aggregate stats that never mention the work repo", async () => {
    const repo = "someone/secret-repo";
    const out = join(mkdtempSync(join(tmpdir(), "tower-refresh-")), "stats.json");
    const queries: string[] = [];
    const search = async (q: string) => {
      queries.push(q);
      if (q.endsWith("author:AngelLCJ")) return 555;
      if (q.includes("merged:>=")) return 288;
      if (q.includes("merged:20")) return 3;
      return 506;
    };
    const stats = await refresh({ search, now: new Date("2026-10-20T18:00:00Z"), repo, author: "AngelLCJ", out });
    const text = readFileSync(out, "utf8");
    expect(loadStats(out)).toEqual(stats);
    expect(stats).toMatchObject({ prsAuthored: 555, prsMerged: 506, merged30d: 288, daily7: [3, 3, 3, 3, 3, 3, 3] });
    expect(text.includes(repo)).toBe(false);
    expect(queries).toHaveLength(10);
    expect(queries.every((q) => q.startsWith(`repo:${repo} is:pr author:AngelLCJ`))).toBe(true);
  });
});
