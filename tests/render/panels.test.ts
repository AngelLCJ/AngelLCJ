import { describe, expect, it } from "vitest";
import { loadHangar, loadTowerConfig } from "../../src/config";
import { renderBoard } from "../../src/render/board";
import { renderHangar } from "../../src/render/hangar";
import { renderFlightLog } from "../../src/render/log";
import { renderWhoami } from "../../src/render/whoami";
import { countMatches, expectWellFormed } from "../helpers/xml";
import { STATS } from "./fixtures";

const config = loadTowerConfig();
const FRESH = new Date("2026-10-21T00:00:00Z");

describe("renderWhoami", () => {
  it("types every line, escaped, after the prompt", () => {
    const svg = renderWhoami(["a <b> & c", ...config.whoami]);
    expectWellFormed(svg);
    expect(svg).toContain("angel@tower:~$ whoami");
    expect(svg).toContain("a &lt;b&gt; &amp; c");
    expect(svg).toContain("Building healthcare software at Reina Madre");
  });
});

describe("renderFlightLog", () => {
  it("lists the career stops", () => {
    const svg = renderFlightLog(config.flightLog);
    expectWellFormed(svg);
    expect(svg).toContain("Reina Madre");
    expect(svg).toContain("45+ accounts");
  });
});

describe("renderHangar", () => {
  it("stamps all six curated repos as classified", () => {
    const svg = renderHangar(loadHangar());
    expectWellFormed(svg);
    for (const name of ["clinic-booking", "habitcare-mvp", "AppEscanerCredencial", "claude-code-dotfiles", "TicketSystemForm", "ventasproject"]) {
      expect(svg).toContain(name);
    }
    expect(countMatches(svg, /\[CLASSIFIED\]/g)).toBe(6);
  });
});

describe("renderBoard", () => {
  it("shows the landed counter as a flight number", () => {
    const svg = renderBoard({ stats: STATS, landings: [{ login: "octo", landedAt: "x" }], now: FRESH });
    expectWellFormed(svg);
    expect(svg).toContain("FLT-0506");
    expect(svg).toContain("24 FLIGHTS");
    expect(svg).toContain("@octo");
  });
  it("shows dashes before the first sync", () => {
    const svg = renderBoard({ stats: null, landings: [], now: FRESH });
    expectWellFormed(svg);
    expect(svg).toContain("FLT-----");
  });
  it("lists at most five visitors", () => {
    const landings = Array.from({ length: 8 }, (_, i) => ({ login: `u${i}`, landedAt: "x" }));
    expect(countMatches(renderBoard({ stats: STATS, landings, now: FRESH }), /VISITOR/g)).toBe(5);
  });
});

describe("static fallbacks", () => {
  it("whoami text is visible even where SMIL does not run", () => {
    const svg = renderWhoami(["hello"]);
    expect(svg).not.toMatch(/<rect[^>]*width="0"[^>]*><animate attributeName="width"/);
  });
  it("hangar purposes fit inside their card", () => {
    for (const card of loadHangar()) expect(card.purpose.length, card.name).toBeLessThanOrEqual(50);
  });
});

describe("renderBoard staleness", () => {
  it("dates the weekly row", () => {
    expect(renderBoard({ stats: STATS, landings: [], now: FRESH })).toContain("SYNC 10-20");
  });
  it("drops the weekly count once stale", () => {
    const svg = renderBoard({ stats: STATS, landings: [], now: new Date("2026-11-05T00:00:00Z") });
    expect(svg).toContain("WEEK · NO RECENT SYNC");
    expect(svg).not.toContain("24 FLIGHTS");
  });
});
