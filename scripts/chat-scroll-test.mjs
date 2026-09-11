/* Chat panel scroll-chaining test: wheel over the message list must
   scroll the LIST and never the page, even past the list's bottom. */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3100";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });

  // open the panel and build enough history to overflow the list
  await page.getByRole("button", { name: /open ask talha/i }).click();
  await page.waitForSelector("[role='dialog']", { timeout: 5000 });
  for (const q of ["What does Talha specialize in?", "Tell me about the malaria project."]) {
    await page.getByRole("button", { name: q }).first().click();
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(500);

  const dialog = page.locator("[role='dialog']");
  const list = page.locator("[role='dialog'] .overflow-y-auto");

  // hover the middle of the message list and wheel down
  const box = await list.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const before = await page.evaluate(() => ({ win: window.scrollY }));
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(600);
  const mid = await page.evaluate(() => ({ win: window.scrollY }));
  const listTop = await list.evaluate((el) => el.scrollTop);
  console.log(`after wheel-down: list.scrollTop=${listTop} window.scrollY ${before.win} → ${mid.win}`);
  if (mid.win !== before.win) throw new Error("page scrolled behind the panel on wheel");
  if (listTop <= 0) throw new Error("message list did not scroll on wheel");

  // wheel far past the bottom — overscroll-contain must keep the page still
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
  const end = await page.evaluate(() => window.scrollY);
  console.log(`after over-wheel past bottom: window.scrollY=${end}`);
  if (end !== before.win) throw new Error("scroll chained to page past list bottom");

  // wheel up back to top — still no page scroll
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(400);
  const up = await page.evaluate(() => window.scrollY);
  if (up !== before.win) throw new Error("scroll chained to page on upward wheel");

  await page.screenshot({ path: "shots/chat-scroll-test.png" });
  await browser.close();
  console.log("SCROLL-CHAINING TEST PASSED");
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
