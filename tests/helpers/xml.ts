import { XMLValidator } from "fast-xml-parser";
import { expect } from "vitest";

export function expectWellFormed(svg: string): void {
  expect(XMLValidator.validate(svg)).toBe(true);
}

export function countMatches(haystack: string, re: RegExp): number {
  return (haystack.match(re) ?? []).length;
}
