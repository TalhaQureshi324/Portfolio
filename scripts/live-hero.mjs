import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto("https://talha-qureshi-portfolio.vercel.app/", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}live-1366.png` });
const m = await page.evaluate(() => {
  const els = [...document.querySelectorAll("h1, h1 ~ * , p")].slice(0, 20);
  const eyebrow = [...document.querySelectorAll("p")].find(p => p.textContent.trim() === "Muhammad Talha Qureshi");
  if (!eyebrow) return { found: false };
  const r = eyebrow.getBoundingClientRect();
  const cs = getComputedStyle(eyebrow);
  const h1 = document.querySelector("h1");
  const h1r = h1.getBoundingClientRect();
  const h1cs = getComputedStyle(h1);
  return {
    found: true,
    eyebrow: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), font: cs.fontFamily.slice(0, 30), size: cs.fontSize, tracking: cs.letterSpacing, color: cs.color, weight: cs.fontWeight, transform: cs.textTransform },
    headline: { x: Math.round(h1r.x), y: Math.round(h1r.y), size: h1cs.fontSize, lines: Math.round(h1r.height / parseFloat(h1cs.lineHeight || h1cs.fontSize)) },
    gap: Math.round(h1r.y - r.bottom),
  };
});
console.log(JSON.stringify(m, null, 1));
await browser.close();
