import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const scrollY = await page.evaluate(() => window.scrollY);
console.log("loads at top:", scrollY === 0 ? "YES" : `NO (${scrollY})`);
const shots = [["01-hero", 0], ["02-work", "#work"], ["03-projects", "#experience"], ["04-contact", "#contact"]];
for (const [name, sel] of shots) {
  if (sel === 0) { await page.evaluate(() => window.scrollTo(0, 0)); }
  else { await page.locator(sel).first().scrollIntoViewIfNeeded(); }
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("✓", name);
}
// mobile pass
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await m.waitForTimeout(2000);
await m.screenshot({ path: `${OUT}05-mobile.png` });
console.log("✓ 05-mobile");
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
console.log("mobile horizontal overflow:", overflow ? "❌ YES" : "✅ none");
await browser.close();
