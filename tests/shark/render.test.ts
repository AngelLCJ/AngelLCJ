import { describe, expect, it } from "vitest";
import { eatTime, renderShark } from "../../src/shark/render";
import { countMatches, expectWellFormed } from "../helpers/xml";

const weeks = (fill: (w: number, d: number) => number) =>
  Array.from({ length: 53 }, (_, w) => Array.from({ length: 7 }, (_, d) => fill(w, d)));

describe("renderShark", () => {
  it("draws one cell per day", () => {
    const svg = renderShark(weeks(() => 1));
    expectWellFormed(svg);
    expect(countMatches(svg, /class="cell"/g)).toBe(371);
  });
  it("only animates cells with contributions", () => {
    const svg = renderShark(weeks((w, d) => (w === 3 && d === 2 ? 5 : 0)));
    expect(countMatches(svg, /<animate /g)).toBe(1);
  });
  it("eats column 3 at 0.75s with the default pace", () => {
    expect(eatTime(3)).toBe(0.75);
    const svg = renderShark(weeks((w) => (w === 3 ? 1 : 0)));
    expect(svg).toContain('data-eat-at="0.75"');
  });
  it("still swims over an empty year", () => {
    const svg = renderShark(weeks(() => 0));
    expectWellFormed(svg);
    expect(svg).toContain('class="shark"');
  });
  it("is deterministic", () => {
    const w = weeks((a, b) => (a * b) % 4);
    expect(renderShark(w)).toBe(renderShark(w));
  });
});
