export type Shift = "day" | "night";

export interface Stats {
  syncedAt: string;
  prsAuthored: number;
  prsMerged: number;
  merged30d: number;
  /** Merged PRs per UTC day, oldest first, always 7 entries. */
  daily7: number[];
}

export interface Landing {
  login: string;
  landedAt: string;
}

export interface FlightLogEntry {
  years: string;
  place: string;
  role: string;
  notes: string[];
}

export interface TowerConfig {
  fleet: string[];
  shift: { start: string; end: string };
  radarSeed: number;
  whoami: string[];
  flightLog: FlightLogEntry[];
}

export interface HangarCard {
  name: string;
  stack: string[];
  purpose: string;
  redact: string;
}
