import { describe, expect, it } from "vitest";
import { renderNumbers } from "../../src/render/numbers";
import { expectWellFormed } from "../helpers/xml";
import { STATS } from "./fixtures";

describe("renderNumbers", () => {
  it("shows both gauges and the sync date", () => {
    const svg = renderNumbers(STATS);
    expectWellFormed(svg);
    expect(svg).toContain("PRs LANDED");
    expect(svg).toContain("LAST 30 DAYS");
    expect(svg).toContain("LAST SYNC 2026-10-20");
  });
  it("shows a waiting caption before the first sync", () => {
    const svg = renderNumbers(null);
    expectWellFormed(svg);
    expect(svg).toContain("AWAITING FIRST SYNC");
  });
});
