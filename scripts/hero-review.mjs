import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const sizes = [
  [1440, 900, "r-1440"],
  [1280, 800, "r-1280"],
  [1024, 768, "r-1024"],
  [768, 1024, "r-768"],
  [390, 844, "r-390"],
];
const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [w, h, name] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`${name}: overflow ${overflow ? "YES❌" : "no"}`);
  await page.screenshot({ path: `${OUT}${name}.png` });
  await page.close();
}
await browser.close();
console.log("DONE");
