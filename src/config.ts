import { readFileSync } from "node:fs";
import { parse } from "yaml";
import type { HangarCard, Landing, Stats, TowerConfig } from "./types";

export const PATHS = {
  tower: "config/tower.yaml",
  hangar: "config/hangar.yaml",
  stats: "data/stats.json",
  landings: "data/landings.json",
} as const;

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
}

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;

export function isStats(v: unknown): v is Stats {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.syncedAt === "string" &&
    !Number.isNaN(Date.parse(s.syncedAt)) &&
    isCount(s.prsAuthored) &&
    isCount(s.prsMerged) &&
    isCount(s.merged30d) &&
    Array.isArray(s.daily7) &&
    s.daily7.length === 7 &&
    s.daily7.every(isCount)
  );
}

function isLanding(v: unknown): v is Landing {
  if (typeof v !== "object" || v === null) return false;
  const l = v as Record<string, unknown>;
  return typeof l.login === "string" && typeof l.landedAt === "string";
}

export function loadTowerConfig(path: string = PATHS.tower): TowerConfig {
  return parse(readFileSync(path, "utf8")) as TowerConfig;
}

export function loadHangar(path: string = PATHS.hangar): HangarCard[] {
  return parse(readFileSync(path, "utf8")) as HangarCard[];
}

/** Never throws: a missing or corrupt file means "no sync yet". */
export function loadStats(path: string = PATHS.stats): Stats | null {
  const v = readJson(path);
  return isStats(v) ? v : null;
}

export function loadLandings(path: string = PATHS.landings): Landing[] {
  const v = readJson(path);
  return Array.isArray(v) ? v.filter(isLanding) : [];
}
