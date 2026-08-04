/**
 * Merge figures pushed by the source repository's CI into the committed
 * snapshot. Run by .github/workflows/snapshot.yml on `repository_dispatch`.
 *
 * Guards, in order of how badly each failure would read on the page:
 *  · only known fields are accepted — a typo'd key is dropped, not stored
 *  · values must be positive integers
 *  · a change larger than 20% needs an explicit flag, because the realistic
 *    failure is a parsing bug turning 3,000 tests into 30, and a wrong number
 *    on this site is worse than a stale one
 */
import { readFileSync, writeFileSync } from "node:fs";

interface Payload {
  pytestPassing?: number;
  tsTests?: number;
  adkAgents?: number;
  commit?: string;
  allowLargeDelta?: boolean;
}

const raw = process.env.PAYLOAD;
if (!raw) {
  console.error("PAYLOAD is empty; nothing to merge");
  process.exit(0);
}

let payload: Payload;
try {
  payload = JSON.parse(raw) as Payload;
} catch {
  console.error("PAYLOAD is not valid JSON");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
let changed = false;

function accept(name: string, next: unknown, current: number): number {
  if (next === undefined || next === null) return current;
  const n = Number(next);
  if (!Number.isInteger(n) || n <= 0) {
    console.error(`rejected ${name}: ${String(next)} is not a positive integer`);
    return current;
  }
  const delta = Math.abs(n - current) / current;
  if (delta > 0.2 && !payload.allowLargeDelta) {
    console.error(
      `rejected ${name}: ${current} → ${n} is a ${(delta * 100).toFixed(0)}% change. ` +
        `Send allowLargeDelta:true if this is real.`,
    );
    return current;
  }
  if (n !== current) changed = true;
  return n;
}

const quality = JSON.parse(readFileSync("data/quality.json", "utf8"));
quality.pytestPassing = accept("pytestPassing", payload.pytestPassing, quality.pytestPassing);
quality.tsTests = accept("tsTests", payload.tsTests, quality.tsTests);

const fleet = JSON.parse(readFileSync("data/fleet.json", "utf8"));
const nextTotal = accept("adkAgents", payload.adkAgents, fleet.counts.total);
if (nextTotal !== fleet.counts.total) {
  // The roster is curated prose, not a generated list. If the count moves, a
  // human has to add the agent and say what it does.
  console.error(
    `agent count moved ${fleet.counts.total} → ${nextTotal}. ` +
      `Edit data/fleet.json by hand so the new agent gets a description.`,
  );
  process.exit(1);
}

if (changed) {
  quality.measuredAt = today;
  if (payload.commit) quality.sourceCommit = payload.commit;
  writeFileSync("data/quality.json", `${JSON.stringify(quality, null, 2)}\n`);
  console.log(`updated data/quality.json @ ${today}`);
} else {
  console.log("no figures changed");
}
