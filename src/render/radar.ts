import { mulberry32 } from "../lib/rng";
import { escapeXml, bezel, phosphor, text } from "../lib/svg";
import { isFresh, syncDay, syncLabel } from "../stats/freshness";
import type { Landing, Shift, Stats, TowerConfig } from "../types";

const WIDTH = 960;
const HEIGHT = 320;
const CX = 175;
const CY = 160;
const R = 128;
const MAX_PR_BLIPS = 40;
const SWEEP_SECONDS = 4;

export interface RadarInput {
  stats: Stats | null;
  landings: Landing[];
  config: TowerConfig;
  shift: Shift;
  now: Date;
}

function polar(angle: number, radius: number): [number, number] {
  return [round(CX + Math.cos(angle) * radius), round(CY + Math.sin(angle) * radius)];
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function scope(color: string, day: boolean): string {
  const rings = [1, 0.66, 0.33]
    .map((f) => `<circle cx="${CX}" cy="${CY}" r="${round(R * f)}" fill="none" stroke="${color}" stroke-opacity="0.3"/>`)
    .join("");
  const cross = `<path d="M${CX - R} ${CY}H${CX + R}M${CX} ${CY - R}V${CY + R}" stroke="${color}" stroke-opacity="0.18"/>`;
  const [ex, ey] = polar(-Math.PI / 4, R);
  const wedge = `<path d="M${CX} ${CY}L${CX + R} ${CY}A${R} ${R} 0 0 0 ${ex} ${ey}Z" fill="${color}" fill-opacity="0.2"/>`;
  const spin = day
    ? `<animateTransform attributeName="transform" type="rotate" from="0 ${CX} ${CY}" to="360 ${CX} ${CY}" dur="${SWEEP_SECONDS}s" repeatCount="indefinite"/>`
    : "";
  return `${rings}${cross}<g class="sweep" transform="rotate(-60 ${CX} ${CY})">${wedge}${spin}</g>`;
}

/** Anonymous traffic: one dot per merged PR, newest days closest to the tower. */
function prBlips(stats: Stats | null, seed: number): string {
  if (!stats) return "";
  const dots: string[] = [];
  stats.daily7.forEach((count, dayIndex) => {
    const rand = mulberry32(seed + dayIndex);
    const band = R * (0.9 - (dayIndex / 7) * 0.7);
    for (let i = 0; i < count && dots.length < MAX_PR_BLIPS; i++) {
      const [x, y] = polar(rand() * Math.PI * 2, band - rand() * R * 0.12);
      dots.push(`<circle class="pr-blip" cx="${x}" cy="${y}" r="1.8" fill-opacity="0.8"/>`);
    }
  });
  return dots.join("");
}

function fleetBlips(fleet: string[], seed: number, day: boolean): string {
  const rand = mulberry32(seed * 7);
  return fleet
    .map((name, i) => {
      const [x, y] = polar((i / fleet.length) * Math.PI * 2 + rand(), R * (0.45 + rand() * 0.3));
      const pulse = day ? `<animate attributeName="r" values="3;6;3" dur="1.6s" begin="${i * 0.4}s" repeatCount="indefinite"/>` : "";
      return `<circle class="fleet-blip" cx="${x}" cy="${y}" r="3.5">${pulse}</circle>${text(x + 8, y - 6, name, 'font-size="10" letter-spacing="1"')}`;
    })
    .join("");
}

function visitorBlips(landings: Landing[], seed: number): string {
  const rand = mulberry32(seed * 13);
  return landings
    .map((l) => {
      const [x, y] = polar(rand() * Math.PI * 2, R * (0.55 + rand() * 0.35));
      return `<rect class="visitor-blip" x="${x - 2.5}" y="${y - 2.5}" width="5" height="5"/>${text(x + 6, y + 3, `@${l.login}`, 'font-size="9" fill-opacity="0.75"')}`;
    })
    .join("");
}

function trafficLine({ stats, now }: RadarInput): string {
  if (!stats) return "TRAFFIC AWAITING FIRST SYNC";
  if (!isFresh(stats, now)) return `TRAFFIC NO SYNC SINCE ${syncDay(stats)}`;
  return `TRAFFIC ${stats.daily7.reduce((a, b) => a + b, 0)} FLIGHTS / 7D · ${syncLabel(stats)}`;
}

function panel(input: RadarInput, day: boolean): string {
  const status = day ? "TOWER ON DUTY" : "NIGHT SHIFT · AUTOPILOT ENGAGED";
  const cursor = day ? '<animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/>' : "";
  const x = 360;
  return [
    text(x, 92, "ÁNGEL CORREA", 'font-size="44" font-weight="700" letter-spacing="4"'),
    text(x, 124, "AI FLEET CONTROL TOWER · CDMX", 'font-size="17" letter-spacing="3" fill-opacity="0.85"'),
    `<text x="${x}" y="176" font-size="15" letter-spacing="2">${escapeXml(`> ${status}`)}<tspan>_${cursor}</tspan></text>`,
    text(x, 212, `FLEET   ${input.config.fleet.join(" · ")}`, 'font-size="13" letter-spacing="2" fill-opacity="0.8"'),
    text(x, 236, trafficLine(input), 'font-size="13" letter-spacing="2" fill-opacity="0.8"'),
    text(x, 260, `VISITORS ${input.landings.length} ON RADAR`, 'font-size="13" letter-spacing="2" fill-opacity="0.8"'),
  ].join("");
}

export function renderRadar(input: RadarInput): string {
  const day = input.shift === "day";
  const color = phosphor(!day);
  const seed = input.config.radarSeed;
  const body = [
    scope(color, day),
    prBlips(isFresh(input.stats, input.now) ? input.stats : null, seed),
    visitorBlips(input.landings, seed),
    fleetBlips(input.config.fleet, seed, day),
    panel(input, day),
  ].join("");
  return bezel({ width: WIDTH, height: HEIGHT, id: "radar", body, dim: !day });
}
