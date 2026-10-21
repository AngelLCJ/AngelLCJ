import { bezel, text } from "../lib/svg";
import { isFresh, syncLabel } from "../stats/freshness";
import type { Landing, Stats } from "../types";

const WIDTH = 960;
const ROW_H = 30;
const MAX_VISITORS = 5;
const COLS = [34, 330, 560, 760];

function row(y: number, cells: string[], attrs = 'font-size="15" letter-spacing="1.5"'): string {
  return cells.map((c, i) => text(COLS[i], y, c, attrs)).join("");
}

function flightNumber(stats: Stats | null): string {
  return stats ? `FLT-${String(stats.prsMerged).padStart(4, "0")}` : "FLT-----";
}

function weekRow(stats: Stats | null, now: Date): string[] {
  if (!isFresh(stats, now)) return ["WEEK · NO RECENT SYNC", "RUNWAY MAIN", "AI FLEET", "STANDBY"];
  return [`WEEK · ${stats.daily7.reduce((a, b) => a + b, 0)} FLIGHTS`, syncLabel(stats), "AI FLEET", "ON TIME"];
}

export function renderBoard({ stats, landings, now }: { stats: Stats | null; landings: Landing[]; now: Date }): string {
  const rows: string[][] = [
    [flightNumber(stats), "RUNWAY MAIN", "AI FLEET", "LANDED"],
    weekRow(stats, now),
    ...landings.slice(0, MAX_VISITORS).map((l) => [`VISITOR · @${l.login}`, "GUEST APRON", "GITHUB", "LANDED"]),
  ];
  let y = 46;
  const parts = [row(y, ["FLIGHT", "GATE", "OPERATOR", "STATUS"], 'font-size="11" letter-spacing="3" fill-opacity="0.6"')];
  y += 12;
  parts.push(`<path d="M34 ${y}H${WIDTH - 34}" stroke="currentColor" stroke-opacity="0.3"/>`);
  for (const cells of rows) {
    y += ROW_H;
    parts.push(row(y, cells));
  }
  if (landings.length === 0) {
    y += ROW_H;
    parts.push(text(34, y, "NO VISITORS YET · REQUEST LANDING BELOW", 'font-size="13" letter-spacing="2" fill-opacity="0.55"'));
  }
  return bezel({ width: WIDTH, height: y + 28, id: "board", body: parts.join("") });
}
