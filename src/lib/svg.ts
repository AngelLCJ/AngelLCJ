import { BG, FONT, PHOSPHOR, PHOSPHOR_NIGHT } from "./palette";

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
};

export function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);
}

export function phosphor(dim = false): string {
  return dim ? PHOSPHOR_NIGHT : PHOSPHOR;
}

/** Glow filter and scanline pattern shared by every CRT panel. */
export function crtDefs(id: string): string {
  return [
    "<defs>",
    `<filter id="${id}-glow" x="-20%" y="-20%" width="140%" height="140%">`,
    '<feGaussianBlur stdDeviation="1.6" result="b"/>',
    '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
    "</filter>",
    `<pattern id="${id}-scan" width="4" height="4" patternUnits="userSpaceOnUse">`,
    '<rect width="4" height="2" fill="#ffffff" fill-opacity="0.035"/>',
    "</pattern>",
    "</defs>",
  ].join("");
}

export interface BezelOptions {
  width: number;
  height: number;
  id: string;
  body: string;
  dim?: boolean;
}

/** A complete SVG document: dark bezel, CRT screen, glowing body, scanlines on top. */
export function bezel({ width, height, id, body, dim = false }: BezelOptions): string {
  const color = phosphor(dim);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}">`,
    crtDefs(id),
    `<rect width="${width}" height="${height}" rx="18" fill="#0d110e"/>`,
    `<rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="12" fill="${BG}" stroke="${color}" stroke-opacity="0.35"/>`,
    `<g filter="url(#${id}-glow)" fill="${color}" color="${color}">${body}</g>`,
    `<rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="12" fill="url(#${id}-scan)" pointer-events="none"/>`,
    "</svg>",
  ].join("");
}

export function text(x: number, y: number, content: string, attrs = ""): string {
  const extra = attrs ? ` ${attrs}` : "";
  return `<text x="${x}" y="${y}"${extra}>${escapeXml(content)}</text>`;
}
