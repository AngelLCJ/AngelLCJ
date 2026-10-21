import { mkdirSync, writeFileSync } from "node:fs";
import { OWNER } from "../landings/landings";
import { fetchCalendar } from "./calendar";
import { renderShark } from "./render";

const OUT = "assets/shark.svg";

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const weeks = await fetchCalendar(OWNER, token);
  mkdirSync("assets", { recursive: true });
  writeFileSync(OUT, `${renderShark(weeks)}\n`);
  console.log(`shark fed: ${weeks.flat().filter((n) => n > 0).length} active days`);
}

main().catch((err: unknown) => {
  console.error(`shark failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
