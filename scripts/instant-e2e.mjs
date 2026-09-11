/* E2E: open chat, click suggestions, verify instant answers + auto-scroll. */
import { chromium } from "playwright-core";

const BASE = "http://localhost:3100";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });

  // open the chat panel
  await page.getByRole("button", { name: /open ask talha/i }).click();
  await page.waitForSelector("[role='dialog']", { timeout: 5000 });
  console.log("panel open ✓");

  // T1: click a suggestion chip → expect an instant answer (<1.5s to render)
  const t0 = Date.now();
  await page.getByRole("button", { name: "Tell me about the malaria project." }).click();
  await page.waitForFunction(
    () => document.querySelector("[role='dialog']")?.innerText.includes("final-year project"),
    null,
    { timeout: 3000 }
  );
  console.log(`T1 suggestion answered in ${Date.now() - t0}ms ✓`);

  // T2: action chips should now render inside the message
  const chip = page.getByRole("button", { name: /view the malaria case study/i }).first();
  await chip.waitFor({ state: "visible", timeout: 2000 });
  console.log("T2 action chip visible ✓");

  // T3: navigation command → page should auto-scroll to the malaria section
  await page.getByLabel(/ask a question about talha/i).fill("take me to his malaria project");
  await page.getByRole("button", { name: "Send question" }).click();
  await page.waitForTimeout(2500); // lenis smooth scroll ~1.3s
  const state = await page.evaluate(() => {
    const el = document.getElementById("malaria-case-study");
    const r = el.getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      sectionTop: Math.round(r.top),
      inView: r.top < window.innerHeight && r.bottom > 0,
    };
  });
  console.log("T3 auto-scroll:", JSON.stringify(state));
  if (state.scrollY < 100 || !state.inView) throw new Error("auto-scroll did not reach the malaria section");

  // T4: contextual follow-up chip answers instantly
  const t1 = Date.now();
  await page.getByRole("button", { name: "What results did the system achieve?" }).click();
  await page.waitForFunction(
    () => document.querySelector("[role='dialog']")?.innerText.includes("96.8%"),
    null,
    { timeout: 3000 }
  );
  console.log(`T4 contextual follow-up answered in ${Date.now() - t1}ms ✓`);

  await page.screenshot({ path: "shots/instant-nav.png" });
  await browser.close();
  console.log("ALL E2E CHECKS PASSED");
})().catch((e) => {
  console.error("E2E FAILED:", e.message);
  process.exit(1);
});
