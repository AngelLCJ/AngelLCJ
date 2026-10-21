import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadHangar, loadLandings, loadStats, loadTowerConfig } from "../src/config";

const tmp = mkdtempSync(join(tmpdir(), "tower-config-"));
const write = (name: string, body: string) => {
  const p = join(tmp, name);
  writeFileSync(p, body);
  return p;
};

describe("loadTowerConfig", () => {
  it("reads the fleet and the four flight-log entries", () => {
    const cfg = loadTowerConfig();
    expect(cfg.fleet).toEqual(["CLAUDE", "CODEX"]);
    expect(cfg.flightLog).toHaveLength(4);
  });
});

describe("loadHangar", () => {
  it("lists exactly the six curated repos in order", () => {
    expect(loadHangar().map((c) => c.name)).toEqual([
      "clinic-booking", "habitcare-mvp", "AppEscanerCredencial",
      "claude-code-dotfiles", "TicketSystemForm", "ventasproject",
    ]);
  });
});

describe("loadStats", () => {
  it("returns null when the file is missing", () => {
    expect(loadStats(join(tmp, "nope.json"))).toBeNull();
  });
  it("returns null for a wrong shape", () => {
    expect(loadStats(write("bad.json", '{"prsMerged":"x"}'))).toBeNull();
  });
  it("returns null for invalid JSON", () => {
    expect(loadStats(write("garbage.json", "{not json"))).toBeNull();
  });
  it("returns the stats for a valid file", () => {
    expect(loadStats("tests/fixtures/stats.json")?.prsMerged).toBe(506);
  });
});

describe("loadLandings", () => {
  it("returns an empty list for garbage", () => {
    expect(loadLandings(write("landings.json", "[[["))).toEqual([]);
  });
});
