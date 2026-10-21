import type { Shift } from "../types";

export const TOWER_TZ = "America/Mexico_City";

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Day shift is the half-open window [start, end) in the tower's local time. */
export function shiftAt(now: Date, shift: { start: string; end: string }, tz: string = TOWER_TZ): Shift {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const local = get("hour") * 60 + get("minute");
  return local >= minutes(shift.start) && local < minutes(shift.end) ? "day" : "night";
}
