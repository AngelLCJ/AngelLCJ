import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadHangar, loadLandings, loadStats, loadTowerConfig, PATHS } from "./config";
import { shiftAt } from "./duty/shift";
import { renderBoard } from "./render/board";
import { renderHangar } from "./render/hangar";
import { renderFlightLog } from "./render/log";
import { renderMetar } from "./render/metar";
import { renderNumbers } from "./render/numbers";
import { renderRadar } from "./render/radar";
import { renderWhoami } from "./render/whoami";

export async function build({ root, now }: { root: string; now: Date }): Promise<string[]> {
  const at = (p: string) => join(root, p);
  const config = loadTowerConfig(at(PATHS.tower));
  const stats = loadStats(at(PATHS.stats));
  const landings = loadLandings(at(PATHS.landings));
  const shift = shiftAt(now, config.shift);

  const assets: Record<string, string> = {
    "radar.svg": renderRadar({ stats, landings, config, shift, now }),
    "numbers.svg": renderNumbers(stats),
    "metar.svg": renderMetar(stats),
    "whoami.svg": renderWhoami(config.whoami),
    "flight-log.svg": renderFlightLog(config.flightLog),
    "hangar.svg": renderHangar(loadHangar(at(PATHS.hangar))),
    "board.svg": renderBoard({ stats, landings, now }),
  };

  const dir = at("assets");
  mkdirSync(dir, { recursive: true });
  return Object.entries(assets).map(([name, svg]) => {
    const path = join(dir, name);
    writeFileSync(path, `${svg}\n`);
    return path;
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  build({ root: process.cwd(), now: new Date() })
    .then((paths) => console.log(`built ${paths.length} assets`))
    .catch((err: unknown) => {
      console.error(`build failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    });
}
