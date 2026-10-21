import { describe, expect, it } from "vitest";
import { addLanding, pruneDeleted, validateLogin } from "../../src/landings/landings";
import type { Landing } from "../../src/types";

const now = new Date("2026-10-20T18:00:00Z");
const opts = { owner: "AngelLCJ", max: 10 };

describe("validateLogin", () => {
  it.each(["a", "octo-cat", "a".repeat(39)])("accepts %s", (l) => expect(validateLogin(l)).toBe(true));
  it.each(["-x", "a".repeat(40), "a b", "<script>", ""])("rejects %s", (l) => expect(validateLogin(l)).toBe(false));
});

describe("addLanding", () => {
  it("puts the newest landing first", () => {
    const { list, outcome } = addLanding([{ login: "old", landedAt: "2026-10-01T00:00:00Z" }], "new", now, opts);
    expect(outcome).toBe("added");
    expect(list.map((l) => l.login)).toEqual(["new", "old"]);
  });
  it("ignores the owner", () => {
    expect(addLanding([], "AngelLCJ", now, opts)).toEqual({ list: [], outcome: "owner" });
  });
  it("ignores the owner case-insensitively", () => {
    expect(addLanding([], "angellcj", now, opts).outcome).toBe("owner");
  });
  it("does not add a duplicate", () => {
    const start: Landing[] = [{ login: "octo", landedAt: "2026-10-01T00:00:00Z" }];
    expect(addLanding(start, "Octo", now, opts)).toEqual({ list: start, outcome: "duplicate" });
  });
  it("rejects invalid logins", () => {
    expect(addLanding([], "<script>", now, opts).outcome).toBe("invalid");
  });
  it("keeps only the 10 newest", () => {
    let list: Landing[] = [];
    for (let i = 0; i < 11; i++) list = addLanding(list, `user${i}`, now, opts).list;
    expect(list).toHaveLength(10);
    expect(list[0].login).toBe("user10");
    expect(list.some((l) => l.login === "user0")).toBe(false);
  });
  it("does not mutate the input", () => {
    const start: Landing[] = [];
    addLanding(start, "octo", now, opts);
    expect(start).toEqual([]);
  });
});

describe("pruneDeleted", () => {
  it("drops accounts that no longer exist", async () => {
    const list: Landing[] = [{ login: "alive", landedAt: "x" }, { login: "gone", landedAt: "y" }];
    const kept = await pruneDeleted(list, async (l) => l === "alive");
    expect(kept.map((l) => l.login)).toEqual(["alive"]);
  });
});
