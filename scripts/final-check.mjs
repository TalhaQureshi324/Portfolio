import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// Notes accordion
await page.locator("#notes").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.getByRole("button", { name: /latency budget/ }).click();
await page.waitForTimeout(700);
const noteOpen = await page.getByText("Real-time stage steering").isVisible();
console.log("notes accordion opens:", noteOpen ? "YES" : "NO");
await page.screenshot({ path: `${OUT}40-notes.png` });

// cursor label state over a systems node
await page.locator("#systems").scrollIntoViewIfNeeded();
await page.waitForTimeout(1600);
await page.getByRole("button", { name: /Monolayer detection/ }).hover();
await page.waitForTimeout(600);
const cursorText = await page.evaluate(() => document.querySelector("[data-cursor]")?.getAttribute("data-cursor"));
console.log("cursor label on node:", cursorText);

// full-page mobile sanity
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await m.waitForTimeout(1500);
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
console.log("mobile overflow:", overflow ? "❌" : "✅ none");

// contact API still healthy
const res = await page.evaluate(async () => {
  const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "T", email: "bad", message: "x" }) });
  return r.status;
});
console.log("API validation (expect 400):", res);
await browser.close();
console.log("DONE");
