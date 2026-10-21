import { bezel, text } from "../lib/svg";
import type { FlightLogEntry } from "../types";

const WIDTH = 960;
const ENTRY_GAP = 18;
const NOTE_H = 20;

export function renderFlightLog(log: FlightLogEntry[]): string {
  let y = 50;
  const parts: string[] = [text(34, y, "LOGBOOK · DEPARTURES → ARRIVALS", 'font-size="13" letter-spacing="3" fill-opacity="0.6"')];
  y += 34;
  log.forEach((entry, i) => {
    const last = i === log.length - 1;
    parts.push(`<circle cx="44" cy="${y - 6}" r="${last ? 7 : 5}"${last ? "" : ' fill-opacity="0.6"'}/>`);
    parts.push(text(64, y, entry.years.toUpperCase(), 'font-size="14" letter-spacing="2" fill-opacity="0.7"'));
    parts.push(text(200, y, entry.place, 'font-size="18" font-weight="700"'));
    parts.push(text(200, y + 22, entry.role, 'font-size="14" fill-opacity="0.85"'));
    const notesTop = y + 22;
    entry.notes.forEach((note, n) => parts.push(text(216, notesTop + (n + 1) * NOTE_H, `· ${note}`, 'font-size="13" fill-opacity="0.7"')));
    const next = notesTop + entry.notes.length * NOTE_H + ENTRY_GAP + 24;
    if (!last) parts.push(`<path d="M44 ${y + 2}V${next - 12}" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 4"/>`);
    y = next;
  });
  return bezel({ width: WIDTH, height: y, id: "log", body: parts.join("") });
}
