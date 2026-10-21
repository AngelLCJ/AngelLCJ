import { FORBIDDEN } from "../lib/forbidden";
import type { Landing } from "../types";

// GitHub username rules: 1-39 chars, alphanumeric or single hyphens, no leading hyphen.
const LOGIN_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

export const MAX_LANDINGS = 10;
export const MIN_ACCOUNT_AGE_DAYS = 30;
export const OWNER = "AngelLCJ";

export type LandingOutcome = "added" | "duplicate" | "owner" | "invalid";

export function validateLogin(login: string): boolean {
  return LOGIN_RE.test(login);
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function addLanding(
  list: Landing[],
  login: string,
  now: Date,
  opts: { owner: string; max: number },
): { list: Landing[]; outcome: LandingOutcome } {
  if (!validateLogin(login) || FORBIDDEN.test(login)) return { list, outcome: "invalid" };
  if (same(login, opts.owner)) return { list, outcome: "owner" };
  if (list.some((l) => same(l.login, login))) return { list, outcome: "duplicate" };
  const next = [{ login, landedAt: now.toISOString() }, ...list].slice(0, opts.max);
  return { list: next, outcome: "added" };
}

export async function pruneDeleted(list: Landing[], exists: (login: string) => Promise<boolean>): Promise<Landing[]> {
  const checks = await Promise.all(list.map((l) => exists(l.login)));
  return list.filter((_, i) => checks[i]);
}
