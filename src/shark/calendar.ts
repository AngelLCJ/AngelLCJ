const QUERY = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
  weeks { contributionDays { contributionCount } } } } } }`;

interface CalendarResponse {
  data?: { user?: { contributionsCollection: { contributionCalendar: { weeks: { contributionDays: { contributionCount: number }[] }[] } } } };
  errors?: { message: string }[];
}

/** Contribution counts as weeks × days (public data; private ones appear only as anonymous counts). */
export async function fetchCalendar(login: string, token: string): Promise<number[][]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL failed: ${res.status}`);
  const json = (await res.json()) as CalendarResponse;
  const weeks = json.data?.user?.contributionsCollection.contributionCalendar.weeks;
  if (!weeks) throw new Error(`GitHub GraphQL returned no calendar${json.errors ? `: ${json.errors[0].message}` : ""}`);
  return weeks.map((w) => w.contributionDays.map((d) => d.contributionCount));
}
