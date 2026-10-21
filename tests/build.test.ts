import { cpSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "../src/build";

const now = new Date("2026-10-20T18:00:00Z");

function sandbox(withStats: boolean): string {
  const root = mkdtempSync(join(tmpdir(), "tower-build-"));
  cpSync("config", join(root, "config"), { recursive: true });
  mkdirSync(join(root, "data"));
  if (withStats) cpSync("tests/fixtures/stats.json", join(root, "data/stats.json"));
  return root;
}

describe("build", () => {
  it("renders all seven assets before the first stats sync", async () => {
    const written = await build({ root: sandbox(false), now });
    expect(written.map((p) => p.split("/").pop()).sort()).toEqual(
      ["board.svg", "flight-log.svg", "hangar.svg", "metar.svg", "numbers.svg", "radar.svg", "whoami.svg"],
    );
  });
  it("is byte-identical across runs with the same inputs", async () => {
    const root = sandbox(true);
    const first = (await build({ root, now })).map((p) => readFileSync(p, "utf8"));
    const second = (await build({ root, now })).map((p) => readFileSync(p, "utf8"));
    expect(second).toEqual(first);
  });
});
