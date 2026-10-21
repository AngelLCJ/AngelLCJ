import type { Stats } from "../types";

const FRESH_FOR_MS = 7 * 86_400_000;

/** Weekly figures only describe "now" while the last sync is under a week old. */
export function isFresh(stats: Stats | null, now: Date): stats is Stats {
  return stats !== null && now.getTime() - Date.parse(stats.syncedAt) <= FRESH_FOR_MS;
}

export function syncDay(stats: Stats): string {
  return stats.syncedAt.slice(5, 10);
}

export function syncLabel(stats: Stats): string {
  return `SYNC ${syncDay(stats)}`;
}
