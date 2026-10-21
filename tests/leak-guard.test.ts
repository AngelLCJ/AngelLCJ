import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FORBIDDEN } from "../src/lib/forbidden";

// Everything tracked becomes public on push, so the guard scans every tracked file.
const SELF = new Set(["tests/leak-guard.test.ts", "src/lib/forbidden.ts"]);
const tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f && !SELF.has(f) && !f.endsWith("package-lock.json"));

describe("leak guard", () => {
  it("has files to scan", () => {
    expect(tracked.length).toBeGreaterThan(20);
  });
  it.each(tracked)("%s contains no private identifiers", (file) => {
    expect(readFileSync(file, "utf8")).not.toMatch(FORBIDDEN);
  });
});

describe("commit identities", () => {
  it("never publish a work email in the history", () => {
    const emails = execFileSync("git", ["log", "--format=%ae%n%ce"], { encoding: "utf8" }).split("\n").filter(Boolean);
    expect(emails.filter((e) => FORBIDDEN.test(e))).toEqual([]);
  });
});
