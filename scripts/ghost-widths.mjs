import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const widths = [1280, 1440, 1536, 1920, 2560, 834, 390];
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: Math.round(w * 0.62) } });
  await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  const m = await page.evaluate(() => {
    const svg = document.querySelector("section svg");
    if (!svg) return { present: false };
    const r = svg.getBoundingClientRect();
    const t = svg.querySelector("text");
    const tb = t ? t.getBBox() : null;
    return {
      present: true,
      svgLeft: Math.round(r.left),
      svgRight: Math.round(r.right),
      viewport: window.innerWidth,
      textEnd: tb ? Math.round(tb.x + tb.width) : -1,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  if (!m.present) {
    console.log(`${w}px → no wordmark (hidden below lg) · overflow:${m.overflowX ? "YES❌" : "no"}`);
  } else {
    const fits = m.svgRight <= m.viewport + 1 && m.textEnd <= m.svgRight + 1;
    console.log(
      `${w}px → svg ${m.svgLeft}..${m.svgRight} (viewport ${m.viewport}) · text ends ${m.textEnd}/${m.svgRight} · overflow:${m.overflowX ? "YES❌" : "no"} → ${fits ? "COMPLETE ✓" : "CLIPPED❌"}`
    );
  }
  if (w === 1440 || w === 2560) {
    const shot = await page.screenshot({ type: "jpeg", quality: 70 });
    const fs = await import("node:fs");
    fs.writeFileSync(`${OUT}${w === 1440 ? 50 : 51}-ghost-${w}.jpg`, shot);
  }
  await page.close();
}
await browser.close();
console.log("DONE");
