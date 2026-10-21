import { bezel, text } from "../lib/svg";
import type { Stats } from "../types";

const STATION = "MMMX"; // ICAO code of Mexico City airport
const TREND_SPAN = 3;

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

function ddhhmm(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
}

function trend(daily7: number[]): "UP" | "DN" | "NSC" {
  const early = sum(daily7.slice(0, TREND_SPAN));
  const late = sum(daily7.slice(-TREND_SPAN));
  if (late > early) return "UP";
  if (late < early) return "DN";
  return "NSC";
}

export function metarLine(stats: Stats | null): string {
  if (!stats) return `METAR ${STATION} NIL`;
  return `METAR ${STATION} ${ddhhmm(stats.syncedAt)}Z PR:${stats.merged30d}/30D WK:${sum(stats.daily7)} TREND:${trend(stats.daily7)} VIS:CLEAR`;
}

export function renderMetar(stats: Stats | null): string {
  const body = text(30, 37, metarLine(stats), 'font-size="17" letter-spacing="1.5"');
  return bezel({ width: 960, height: 60, id: "metar", body });
}
