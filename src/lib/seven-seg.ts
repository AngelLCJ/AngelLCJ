type Segment = "a" | "b" | "c" | "d" | "e" | "f" | "g";

const SEGMENT_MAP: Record<string, Segment[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "d", "c"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "f", "g", "d"],
  "-": ["g"],
  " ": [],
};

const ALL: Segment[] = ["a", "b", "c", "d", "e", "f", "g"];

export interface SevenSegOptions {
  x: number;
  y: number;
  h: number;
  color: string;
  off: string;
}

/** Polygon for one segment of a digit whose top-left is (0,0), width w, height h, thickness t. */
function segmentPoints(seg: Segment, w: number, h: number, t: number): string {
  const half = h / 2;
  const horiz = (y: number) => [[t, y], [w - t, y], [w - t / 2, y + t / 2], [w - t, y + t], [t, y + t], [t / 2, y + t / 2]];
  const vert = (x: number, y0: number, y1: number) => [[x + t / 2, y0], [x + t, y0 + t / 2], [x + t, y1 - t / 2], [x + t / 2, y1], [x, y1 - t / 2], [x, y0 + t / 2]];
  const shapes: Record<Segment, number[][]> = {
    a: horiz(0),
    g: horiz(half - t / 2),
    d: horiz(h - t),
    f: vert(0, t / 2, half),
    b: vert(w - t, t / 2, half),
    e: vert(0, half, h - t / 2),
    c: vert(w - t, half, h - t / 2),
  };
  return shapes[seg].map(([px, py]) => `${round(px)},${round(py)}`).join(" ");
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function digitWidth(h: number): number {
  return h * 0.55;
}

export function sevenSeg(value: string, { x, y, h, color, off }: SevenSegOptions): string {
  const w = digitWidth(h);
  const t = h * 0.1;
  const gap = h * 0.18;
  const digits = [...value].map((ch, i) => {
    const on = SEGMENT_MAP[ch];
    if (!on) throw new Error(`sevenSeg: unsupported character "${ch}"`);
    const polys = ALL.map(
      (seg) => `<polygon points="${segmentPoints(seg, w, h, t)}" fill="${on.includes(seg) ? color : off}"/>`,
    ).join("");
    return `<g transform="translate(${round(x + i * (w + gap))},${y})">${polys}</g>`;
  });
  return `<g class="seven-seg">${digits.join("")}</g>`;
}
