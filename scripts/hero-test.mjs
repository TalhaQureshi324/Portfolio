import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(3200); // full entrance
await page.screenshot({ path: `${OUT}30-hero-v2.png` });
console.log("✓ 30 desktop settled");
// parallax response
await page.mouse.move(1100, 300);
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}31-hero-parallax.png` });
console.log("✓ 31 parallax shifted");
// scroll handoff
await page.mouse.wheel(0, 500);
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}32-hero-scroll.png` });
console.log("✓ 32 scroll handoff");
// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await m.waitForTimeout(2800);
await m.screenshot({ path: `${OUT}33-mobile-hero.png` });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
console.log("mobile overflow:", overflow ? "❌" : "✅ none");
await browser.close();
