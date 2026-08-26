/**
 * Visual verification — drives the installed Edge browser headlessly
 * via playwright-core and captures each section of the portfolio.
 * Run: node scripts/screenshot.mjs [url]
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "http://localhost:3100/";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const shots = [
  ["01-hero", "#top"],
  ["02-about", "#about"],
  ["03-malaria", "#malaria-screening"],
  ["04-automation", "#outbound-engine"],
  ["05-experience", "#experience"],
];

for (const [name, sel] of shots) {
  await page.locator(sel).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("✓", name);
}

await browser.close();
console.log("DONE →", OUT);
