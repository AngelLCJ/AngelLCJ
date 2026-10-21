import { bezel, text } from "../lib/svg";
import type { HangarCard } from "../types";

const WIDTH = 960;
const COLS = 2;
const CARD_W = 430;
const CARD_H = 132;
const GAP = 24;
const TOP = 66;
const CHAR_W = 13 * 0.6;

function card(c: HangarCard, x: number, y: number): string {
  const barW = Math.round(c.redact.length * CHAR_W + 12);
  return [
    `<rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.45"/>`,
    text(x + 16, y + 28, `▣ ${c.name}`, 'font-size="17" font-weight="700"'),
    text(x + CARD_W - 16, y + 28, "[CLASSIFIED]", 'font-size="11" letter-spacing="2" text-anchor="end" fill-opacity="0.75"'),
    text(x + 16, y + 54, c.purpose, 'font-size="12.5" fill-opacity="0.85"'),
    text(x + 16, y + 80, "core:", 'font-size="12" fill-opacity="0.6"'),
    // The redacted phrase is drawn and then covered, like a blacked-out document.
    text(x + 62, y + 80, c.redact, 'font-size="13"'),
    `<rect x="${x + 58}" y="${y + 67}" width="${barW}" height="17" fill="currentColor"/>`,
    text(x + 16, y + 110, c.stack.join(" · "), `font-size="12" fill-opacity="0.75"`),
  ].join("");
}

export function renderHangar(cards: HangarCard[]): string {
  const rows = Math.ceil(cards.length / COLS);
  const left = (WIDTH - (COLS * CARD_W + (COLS - 1) * GAP)) / 2;
  const body = [
    text(34, 44, "HANGAR · ACCESS LEVEL: RESTRICTED · SOURCE SEALED", 'font-size="13" letter-spacing="3" fill-opacity="0.6"'),
    ...cards.map((c, i) => card(c, left + (i % COLS) * (CARD_W + GAP), TOP + Math.floor(i / COLS) * (CARD_H + GAP))),
  ].join("");
  return bezel({ width: WIDTH, height: TOP + rows * (CARD_H + GAP) + 10, id: "hangar", body });
}
