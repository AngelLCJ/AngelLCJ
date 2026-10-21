// Thin REST client for the Actions runner; uses the workflow's GITHUB_TOKEN.
const API = "https://api.github.com";

function headers(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" };
}

async function call(token: string, method: string, path: string, body?: unknown): Promise<Response> {
  const res = await fetch(`${API}${path}`, { method, headers: headers(token), body: body === undefined ? undefined : JSON.stringify(body) });
  if (!res.ok && res.status !== 404) throw new Error(`GitHub ${method} ${path} failed: ${res.status}`);
  return res;
}

export async function getUser(token: string, login: string): Promise<{ created_at: string } | null> {
  const res = await call(token, "GET", `/users/${encodeURIComponent(login)}`);
  return res.status === 404 ? null : ((await res.json()) as { created_at: string });
}

export async function userExists(token: string, login: string): Promise<boolean> {
  return (await getUser(token, login)) !== null;
}

export async function comment(token: string, repo: string, issue: number, body: string): Promise<void> {
  await call(token, "POST", `/repos/${repo}/issues/${issue}/comments`, { body });
}

export async function closeAndLock(token: string, repo: string, issue: number): Promise<void> {
  await call(token, "PATCH", `/repos/${repo}/issues/${issue}`, { state: "closed", state_reason: "completed" });
  await call(token, "PUT", `/repos/${repo}/issues/${issue}/lock`, { lock_reason: "resolved" });
}

export interface OpenLandingIssue {
  number: number;
  user: { login: string };
}

export async function listOpenLandings(token: string, repo: string): Promise<OpenLandingIssue[]> {
  const res = await call(token, "GET", `/repos/${repo}/issues?state=open&labels=landing&per_page=50`);
  const items = (await res.json()) as (OpenLandingIssue & { pull_request?: unknown })[];
  return items.filter((i) => !i.pull_request).map((i) => ({ number: i.number, user: { login: i.user.login } }));
}
