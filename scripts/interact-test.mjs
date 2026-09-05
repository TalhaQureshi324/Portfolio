import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// 1. Tech map — hover "OpenCV", check panel + cross-highlight
await page.locator("#expertise").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "OpenCV" }).hover();
await page.waitForTimeout(700);
const litCount = await page.evaluate(() => document.querySelectorAll("[data-project].project-lit").length);
console.log("cross-highlight lit projects (expect 2: malaria + deepfake):", litCount);
await page.screenshot({ path: `${OUT}10-techmap.png` });
console.log("✓ 10-techmap");

// 2. Systems explorer — switch system, then click a non-core node
await page.locator("#systems").scrollIntoViewIfNeeded();
await page.waitForTimeout(1800); // assembly animation
await page.getByRole("button", { name: "Lead Automation" }).click();
await page.waitForTimeout(1400);
await page.getByRole("button", { name: /Website audit/ }).click();
await page.waitForTimeout(700);
const panelText = await page.locator("#systems [aria-live='polite']").innerText();
console.log("panel shows audit node:", panelText.includes("Headless browser bots") ? "YES" : "NO — got: " + panelText.slice(0, 80));
await page.screenshot({ path: `${OUT}11-systems.png` });
console.log("✓ 11-systems");

// 3. Mobile check of both
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await m.locator("#systems").scrollIntoViewIfNeeded();
await m.waitForTimeout(1800);
await m.getByRole("button", { name: /Cell detection/ }).click();
await m.waitForTimeout(600);
await m.screenshot({ path: `${OUT}12-mobile-systems.png` });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
console.log("mobile overflow:", overflow ? "❌" : "✅ none");
console.log("✓ 12-mobile-systems");
await browser.close();
