import { mkdir, writeFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "../components/og-card";
import { ogFonts } from "../lib/og-fonts";

async function main() {
  const response = new ImageResponse(<OgCard />, { ...OG_SIZE, fonts: ogFonts });
  const image = Buffer.from(await response.arrayBuffer());
  await mkdir("public/og", { recursive: true });
  await writeFile("public/og/agentbase.png", image);
  console.log(`Generated public/og/agentbase.png (${image.length} bytes, 1200×630)`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
