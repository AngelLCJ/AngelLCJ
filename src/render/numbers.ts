import { CELL_OFF, PHOSPHOR } from "../lib/palette";
import { digitWidth, sevenSeg } from "../lib/seven-seg";
import { bezel, text } from "../lib/svg";
import type { Stats } from "../types";

const DIGIT_H = 64;
const DIGIT_GAP = DIGIT_H * 0.18;
const WIDTH = 960;
const HEIGHT = 170;

function gauge(cx: number, label: string, value: string): string {
  const w = value.length * digitWidth(DIGIT_H) + (value.length - 1) * DIGIT_GAP;
  return [
    sevenSeg(value, { x: cx - w / 2, y: 34, h: DIGIT_H, color: PHOSPHOR, off: CELL_OFF }),
    text(cx, 128, label, 'font-size="15" letter-spacing="3" text-anchor="middle"'),
  ].join("");
}

export function renderNumbers(stats: Stats | null): string {
  const landed = stats ? String(stats.prsMerged) : "---";
  const month = stats ? String(stats.merged30d) : "---";
  const caption = stats ? `LAST SYNC ${stats.syncedAt.slice(0, 10)}` : "AWAITING FIRST SYNC";
  const body = [
    gauge(WIDTH * 0.3, "PRs LANDED", landed),
    gauge(WIDTH * 0.7, "LAST 30 DAYS", month),
    text(WIDTH / 2, 154, caption, 'font-size="11" letter-spacing="2" text-anchor="middle" fill-opacity="0.6"'),
  ].join("");
  return bezel({ width: WIDTH, height: HEIGHT, id: "numbers", body });
}
