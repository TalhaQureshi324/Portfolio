import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "msedge", headless: true });
// user's laptop-ish viewport
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(2600);
const m = await page.evaluate(() => {
  const h1 = document.querySelector("h1").getBoundingClientRect();
  const img = document.querySelector("h1 + * , section figure img, figure img");
  const fig = document.querySelector("figure").getBoundingClientRect();
  return { headlineTop: Math.round(h1.y), portraitTop: Math.round(fig.y), delta: Math.round(fig.y - h1.y) };
});
console.log("1366×768 → headline top:", m.headlineTop, "· portrait top:", m.portraitTop, "· delta:", m.delta, "px");
await page.screenshot({ path: "shots/balance-1366.png" });
const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p2.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await p2.waitForTimeout(2600);
const m2 = await p2.evaluate(() => {
  const h1 = document.querySelector("h1").getBoundingClientRect();
  const fig = document.querySelector("figure").getBoundingClientRect();
  return { headlineTop: Math.round(h1.y), portraitTop: Math.round(fig.y), delta: Math.round(fig.y - h1.y) };
});
console.log("1440×900 → headline top:", m2.headlineTop, "· portrait top:", m2.portraitTop, "· delta:", m2.delta, "px");
await p2.screenshot({ path: "shots/balance-1440.png" });
await browser.close();
console.log("DONE");
