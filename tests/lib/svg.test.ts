import { describe, expect, it } from "vitest";
import { bezel, escapeXml } from "../../src/lib/svg";
import { mulberry32 } from "../../src/lib/rng";
import { expectWellFormed } from "../helpers/xml";

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;");
  });
});

describe("bezel", () => {
  it("wraps the body in a well-formed CRT svg document", () => {
    const svg = bezel({ width: 400, height: 200, id: "t", body: "<g/>" });
    expectWellFormed(svg);
    expect(svg).toContain('fill="#020a04"');
    expect(svg).toContain("url(#t-scan)");
  });
});

describe("mulberry32", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
