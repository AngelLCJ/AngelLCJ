import { describe, expect, it } from "vitest";
import { shiftAt } from "../../src/duty/shift";

const SHIFT = { start: "08:00", end: "22:00" };
const at = (iso: string) => shiftAt(new Date(iso), SHIFT);

// CDMX is UTC-6 all year (no DST since 2022).
describe("shiftAt", () => {
  it("is night at 07:59 CDMX", () => expect(at("2026-10-20T13:59:00Z")).toBe("night"));
  it("is day at 08:00 CDMX", () => expect(at("2026-10-20T14:00:00Z")).toBe("day"));
  it("is day at 21:59 CDMX", () => expect(at("2026-10-21T03:59:00Z")).toBe("day"));
  it("is night at 22:00 CDMX", () => expect(at("2026-10-21T04:00:00Z")).toBe("night"));
});
