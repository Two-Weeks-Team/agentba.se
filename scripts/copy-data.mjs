// Mirror data/*.json into public/data so agents can fetch the raw snapshots
// that /llms.txt points at. Generated; public/data is gitignored.
import { cpSync, mkdirSync } from "node:fs";
mkdirSync("public/data", { recursive: true });
cpSync("data", "public/data", { recursive: true });
console.log("copied data/ -> public/data/");
