import { describe, expect, it } from "vitest";
import { metarLine, renderMetar } from "../../src/render/metar";
import { expectWellFormed } from "../helpers/xml";
import { STATS } from "./fixtures";

describe("metarLine", () => {
  it("formats the aviation report from aggregate stats", () => {
    expect(metarLine(STATS)).toBe("METAR MMMX 201800Z PR:288/30D WK:24 TREND:UP VIS:CLEAR");
  });
  it("reports DN when the week cools down", () => {
    expect(metarLine({ ...STATS, daily7: [5, 5, 5, 0, 1, 1, 1] })).toContain("TREND:DN");
  });
  it("reports NSC when the week is flat", () => {
    expect(metarLine({ ...STATS, daily7: [1, 1, 1, 9, 1, 1, 1] })).toContain("TREND:NSC");
  });
  it("reports NIL without stats", () => {
    expect(metarLine(null)).toBe("METAR MMMX NIL");
  });
  it("renders a well-formed strip", () => {
    expectWellFormed(renderMetar(STATS));
    expectWellFormed(renderMetar(null));
  });
});
