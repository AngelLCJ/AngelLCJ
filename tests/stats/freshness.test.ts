import { describe, expect, it } from "vitest";
import { isFresh, syncLabel } from "../../src/stats/freshness";
import { STATS } from "../render/fixtures";

describe("isFresh", () => {
  it("is fresh within 7 days of the sync", () => expect(isFresh(STATS, new Date("2026-10-27T17:59:00Z"))).toBe(true));
  it("is stale after 7 days", () => expect(isFresh(STATS, new Date("2026-10-27T18:01:00Z"))).toBe(false));
  it("is never fresh without stats", () => expect(isFresh(null, new Date())).toBe(false));
});

describe("syncLabel", () => {
  it("formats the sync day", () => expect(syncLabel(STATS)).toBe("SYNC 10-20"));
});
