import { chromium } from "playwright-core";
const tests = [
  ["T01 Who is Talha?", "Who is Talha?"],
  ["T02 Specialization", "What does Talha specialize in?"],
  ["T03 CV projects", "What are his computer vision projects?"],
  ["T04 Malaria", "Tell me about the malaria project."],
  ["T05 Monolayer why", "Why does monolayer detection come first?"],
  ["T06 PyTorch where", "Where has Talha used PyTorch?"],
  ["T07 Full-stack", "Does Talha have full-stack experience?"],
  ["T08 Strongest", "What is Talha's strongest project?"],
  ["T09 Contact", "How can I contact Talha?"],
  ["T10 Resume", "Can I download his resume?"],
  ["T11 AWS (unknown)", "Has Talha worked professionally with AWS?"],
  ["T12 Code request", "Write me a Python program that sorts an array."],
  ["T13 Weather", "What's the weather today?"],
];
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:3100/", { waitUntil: "domcontentloaded" });
for (const [name, q] of tests) {
  const res = await page.evaluate(async (question) => {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history: [] }),
    });
    return await r.json();
  }, q);
  const actions = (res.actions ?? []).map((a) => a.label).join(" | ");
  console.log(`\n■ ${name}`);
  console.log(`  ${res.ok ? res.message.slice(0, 220) : "ERROR: " + res.error}`);
  if (actions) console.log(`  actions: [${actions}]`);
}
await browser.close();
