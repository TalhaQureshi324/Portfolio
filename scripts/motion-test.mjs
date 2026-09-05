import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// WOW#1 — hero mid-scroll transformation
await page.mouse.wheel(0, 450);
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}20-hero-transform.png` });
console.log("✓ 20-hero-transform");

// WOW#2 — nav scroll-spy (should be About active after scrolling there)
await page.evaluate(() => document.getElementById("about")?.scrollIntoView({ behavior: "instant" }));
await page.waitForTimeout(1200);
const activeNav = await page.evaluate(() => document.querySelector("header [aria-current='true']")?.textContent?.trim());
console.log("nav active section (expect About):", activeNav ?? "none");
await page.screenshot({ path: `${OUT}21-nav-spy.png` });

// WOW#3 — experience rail mid-fill
await page.evaluate(() => document.getElementById("experience")?.scrollIntoView({ behavior: "instant" }));
await page.mouse.wheel(0, 500);
await page.waitForTimeout(1200);
const fillScale = await page.evaluate(() => {
  const el = document.querySelector("#experience .bg-accent");
  return el ? getComputedStyle(el).transform : "not-found";
});
console.log("experience rail fill transform:", fillScale !== "not-found" && fillScale !== "none" ? "ACTIVE ✓" : fillScale);
await page.screenshot({ path: `${OUT}22-experience-fill.png` });
console.log("✓ 22-experience-fill");

// WOW#4 — contact final scene (statement revealed)
await page.evaluate(() => document.getElementById("contact")?.scrollIntoView({ behavior: "instant" }));
await page.mouse.wheel(0, 350);
await page.waitForTimeout(1400);
await page.screenshot({ path: `${OUT}23-contact-scene.png` });
console.log("✓ 23-contact-scene");

await browser.close();
