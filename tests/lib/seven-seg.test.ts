import { describe, expect, it } from "vitest";
import { sevenSeg } from "../../src/lib/seven-seg";
import { countMatches } from "../helpers/xml";

const ON = "#39ff6a";
const opts = { x: 0, y: 0, h: 40, color: ON, off: "#0b1f10" };
const lit = (v: string) => countMatches(sevenSeg(v, opts), new RegExp(`fill="${ON}"`, "g"));

describe("sevenSeg", () => {
  it("lights 7 segments for 8", () => expect(lit("8")).toBe(7));
  it("lights 2 segments for 1", () => expect(lit("1")).toBe(2));
  it("lights 1 segment for a dash", () => expect(lit("-")).toBe(1));
  it("lights nothing for a space", () => expect(lit(" ")).toBe(0));
  it("throws on an unsupported character", () => expect(() => sevenSeg("x", opts)).toThrow());
});
