import { describe, expect, it } from "vitest";
import { buildStats, dayWindow } from "../../src/stats/aggregate";

describe("dayWindow", () => {
  it("returns the 7 UTC dates ending today, oldest first", () => {
    expect(dayWindow(new Date("2026-10-20T15:00:00Z"))).toEqual([
      "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20",
    ]);
  });
});

describe("buildStats", () => {
  const now = new Date("2026-10-20T18:00:00Z");
  it("stamps syncedAt with the given time", () => {
    const s = buildStats({ authored: 555, merged: 506, merged30d: 288, daily7: [1, 2, 3, 0, 5, 6, 7] }, now);
    expect(s).toEqual({ syncedAt: "2026-10-20T18:00:00.000Z", prsAuthored: 555, prsMerged: 506, merged30d: 288, daily7: [1, 2, 3, 0, 5, 6, 7] });
  });
  it("throws when daily7 does not have 7 entries", () => {
    expect(() => buildStats({ authored: 1, merged: 1, merged30d: 1, daily7: [1, 2] }, now)).toThrow();
  });
});
