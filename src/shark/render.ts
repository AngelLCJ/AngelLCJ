import { CELL_OFF, PHOSPHOR } from "../lib/palette";
import { bezel, text } from "../lib/svg";

const CELL = 13;
const GAP = 3;
const PITCH = CELL + GAP;
const LEFT = 40;
const TOP = 52;
const REST_SECONDS = 2;
const LEVELS = [0.3, 0.55, 0.8, 1];
export const SECONDS_PER_COLUMN = 0.25;

export function eatTime(col: number, secondsPerColumn = SECONDS_PER_COLUMN): number {
  return Math.round(col * secondsPerColumn * 1000) / 1000;
}

/** Opacity level for a count, split by quartiles of the non-zero counts. */
function leveler(weeks: number[][]): (n: number) => number {
  const sorted = weeks.flat().filter((n) => n > 0).sort((a, b) => a - b);
  const q = (f: number) => sorted[Math.min(sorted.length - 1, Math.floor(f * sorted.length))] ?? 0;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  return (n) => LEVELS[cuts.filter((c) => n > c).length];
}

const SHARK_PATH =
  "M0 10 C8 2 22 0 34 6 L42 0 L40 9 C44 10 46 12 46 13 C40 16 30 19 18 18 L14 24 L12 17 C6 16 2 13 0 10 Z";

const SHARK_NOSE = 46;

/** The nose reaches each column's centre exactly when that column is eaten. */
function shark(total: number, travel: number, columns: number, rowsMid: number): string {
  const y = rowsMid - 12;
  const from = LEFT + CELL / 2 - SHARK_NOSE;
  const to = from + columns * PITCH;
  const swimEnd = (travel / total).toFixed(4);
  return [
    `<g class="shark" transform="translate(${from} ${y})">`,
    `<animateTransform attributeName="transform" type="translate" values="${from} ${y};${to} ${y};${to} ${y}" keyTimes="0;${swimEnd};1" dur="${total.toFixed(2)}s" repeatCount="indefinite"/>`,
    `<path d="${SHARK_PATH}" fill="none" stroke="${PHOSPHOR}" stroke-width="1.6"/>`,
    '<circle cx="36" cy="9" r="1.4"/>',
    "</g>",
  ].join("");
}

export function renderShark(weeks: number[][], opts: { secondsPerColumn?: number } = {}): string {
  const spc = opts.secondsPerColumn ?? SECONDS_PER_COLUMN;
  const level = leveler(weeks);
  const travel = weeks.length * spc;
  const total = travel + REST_SECONDS;
  const cells = weeks.flatMap((days, col) =>
    days.map((count, row) => {
      const x = LEFT + col * PITCH;
      const y = TOP + row * PITCH;
      if (count === 0) return `<rect class="cell" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${CELL_OFF}"/>`;
      const t = eatTime(col, spc);
      const keyTimes = `0;${(t / total).toFixed(4)};${(travel / total).toFixed(4)};1`;
      return `<rect class="cell" data-eat-at="${t}" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${PHOSPHOR}" fill-opacity="${level(count)}"><animate attributeName="opacity" values="1;0;0;1" keyTimes="${keyTimes}" calcMode="discrete" dur="${total.toFixed(2)}s" repeatCount="indefinite"/></rect>`;
    }),
  );
  const width = LEFT * 2 + weeks.length * PITCH;
  const height = TOP + 7 * PITCH + 34;
  const body = [
    text(LEFT, 34, "SONAR · CONTRIBUTIONS · LAST 12 MONTHS", 'font-size="12" letter-spacing="3" fill-opacity="0.6"'),
    ...cells,
    shark(total, travel, weeks.length, TOP + 3.5 * PITCH),
  ].join("");
  return bezel({ width: Math.max(width, 960), height, id: "shark", body });
}
