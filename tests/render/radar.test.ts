import { describe, expect, it } from "vitest";
import { loadTowerConfig } from "../../src/config";
import { renderRadar } from "../../src/render/radar";
import { countMatches, expectWellFormed } from "../helpers/xml";
import { STATS } from "./fixtures";

const config = loadTowerConfig();
const base = { stats: STATS, landings: [], config, shift: "day" as const, now: new Date("2026-10-21T00:00:00Z") };
const prBlips = (svg: string) => countMatches(svg, /class="pr-blip"/g);

describe("renderRadar", () => {
  it("sweeps and reports on duty during the day", () => {
    const svg = renderRadar(base);
    expectWellFormed(svg);
    expect(svg).toContain("animateTransform");
    expect(svg).toContain("TOWER ON DUTY");
    expect(svg).toContain("ÁNGEL CORREA");
  });
  it("sweeps once every 4 seconds during the day", () => {
    expect(renderRadar(base)).toMatch(/<animateTransform[^>]*dur="4s"/);
  });
  it("keeps sweeping slowly at night so the tower never looks frozen", () => {
    const svg = renderRadar({ ...base, shift: "night" });
    expectWellFormed(svg);
    expect(svg).toContain("NIGHT SHIFT · AUTOPILOT ENGAGED");
    expect(svg).toMatch(/<animateTransform[^>]*dur="12s"/);
  });
  it("stops the fleet pulse at night", () => {
    expect(renderRadar({ ...base, shift: "night" })).not.toContain('attributeName="r"');
  });
  it("draws one blip per merged PR this week", () => {
    expect(prBlips(renderRadar(base))).toBe(24);
  });
  it("caps PR blips at 40", () => {
    expect(prBlips(renderRadar({ ...base, stats: { ...STATS, daily7: [20, 20, 20, 20, 20, 0, 0] } }))).toBe(40);
  });
  it("labels each fleet member and each visitor", () => {
    const svg = renderRadar({ ...base, landings: [{ login: "octo-cat", landedAt: "2026-10-20T00:00:00Z" }] });
    expect(svg).toContain("@octo-cat");
    expect(svg).toContain("CLAUDE");
    expect(svg).toContain("CODEX");
  });
  it("renders without stats", () => {
    const svg = renderRadar({ ...base, stats: null });
    expectWellFormed(svg);
    expect(prBlips(svg)).toBe(0);
  });
  it("is deterministic", () => {
    expect(renderRadar(base)).toBe(renderRadar(base));
  });
});

describe("renderRadar staleness", () => {
  const stale = new Date("2026-11-05T12:00:00Z");
  it("labels this week's traffic with its sync date", () => {
    expect(renderRadar({ ...base, now: new Date("2026-10-21T00:00:00Z") })).toContain("TRAFFIC 24 FLIGHTS / 7D · SYNC 10-20");
  });
  it("stops showing traffic once the sync is over a week old", () => {
    const svg = renderRadar({ ...base, now: stale });
    expect(svg).toContain("TRAFFIC NO SYNC SINCE 10-20");
    expect(prBlips(svg)).toBe(0);
  });
});
