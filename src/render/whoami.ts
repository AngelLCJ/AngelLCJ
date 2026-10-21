import { bezel, escapeXml } from "../lib/svg";

const WIDTH = 960;
const FONT_SIZE = 18;
const CHAR_W = FONT_SIZE * 0.6; // monospace advance
const LINE_H = 34;
const SECONDS_PER_CHAR = 0.045;
const PAUSE = 0.5;
const PROMPT = "angel@tower:~$ whoami";

/**
 * Discrete width steps so the clip reveals one character at a time, starting at `begin`.
 * The base width is the full line, so renderers without SMIL still show the text.
 */
function typingClip(id: string, x: number, y: number, chars: number, begin: number): string {
  const w = (k: number) => Math.round(k * CHAR_W * 10) / 10;
  const dur = begin + Math.max(chars, 1) * SECONDS_PER_CHAR;
  const steps = Array.from({ length: chars + 1 }, (_, k) => k);
  const keyTimes = steps.map((k) => (k === 0 ? 0 : (begin + k * SECONDS_PER_CHAR) / dur).toFixed(4)).join(";");
  const values = steps.map(w).join(";");
  return `<clipPath id="${id}"><rect x="${x}" y="${y - FONT_SIZE}" height="${FONT_SIZE + 8}" width="${w(chars)}"><animate attributeName="width" values="${values}" keyTimes="${keyTimes}" calcMode="discrete" dur="${dur.toFixed(2)}s" begin="0s" fill="freeze"/></rect></clipPath>`;
}

export function renderWhoami(lines: string[]): string {
  const all = [PROMPT, ...lines.map((l) => `> ${l}`)];
  let begin = 0.3;
  const parts = all.map((line, i) => {
    const x = 34;
    const y = 52 + i * LINE_H;
    const clip = typingClip(`w${i}`, x, y, line.length, begin);
    begin += line.length * SECONDS_PER_CHAR + PAUSE;
    const attrs = `font-size="${FONT_SIZE}" clip-path="url(#w${i})"${i === 0 ? ' fill-opacity="0.7"' : ""}`;
    return `${clip}<text x="${x}" y="${y}" ${attrs}>${escapeXml(line)}</text>`;
  });
  const cursorY = 52 + all.length * LINE_H;
  const cursor = `<rect x="34" y="${cursorY - FONT_SIZE + 2}" width="${CHAR_W}" height="${FONT_SIZE}"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>`;
  const height = cursorY + 30;
  return bezel({ width: WIDTH, height, id: "whoami", body: parts.join("") + cursor });
}

