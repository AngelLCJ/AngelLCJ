import type { Stats } from "../types";

const DAY_MS = 86_400_000;
export const WINDOW_DAYS = 7;

export interface Counts {
  authored: number;
  merged: number;
  merged30d: number;
  daily7: number[];
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The last 7 UTC calendar days ending today, oldest first. */
export function dayWindow(now: Date): string[] {
  return Array.from({ length: WINDOW_DAYS }, (_, i) => isoDay(new Date(now.getTime() - (WINDOW_DAYS - 1 - i) * DAY_MS)));
}

export function daysAgo(now: Date, days: number): string {
  return isoDay(new Date(now.getTime() - days * DAY_MS));
}

export function buildStats(counts: Counts, now: Date): Stats {
  if (counts.daily7.length !== WINDOW_DAYS) {
    throw new Error(`buildStats: daily7 must have ${WINDOW_DAYS} entries, got ${counts.daily7.length}`);
  }
  return {
    syncedAt: now.toISOString(),
    prsAuthored: counts.authored,
    prsMerged: counts.merged,
    merged30d: counts.merged30d,
    daily7: [...counts.daily7],
  };
}
