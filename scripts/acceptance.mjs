// The four acceptance tests from the brief
const tests = [
  ["A1 Recruiter fit (Redis+Playwright)", "I am a recruiter, should I hire Talha for AI engineer role. We need expertise in Redis, Playwright.",
    (m) => m.includes("Playwright") && m.includes("Redis") && /interview/i.test(m) && /direct project evidence/i.test(m)],
  ["A2 Requirement gap (K8s/AWS/GPU/5yrs)", "We're looking for an AI engineer with Kubernetes, AWS, distributed GPU training and 5+ years of production experience. Should we hire Talha?",
    (m) => !/strong match/i.test(m.split("\n")[0]) && /Kubernetes|GPU|years/i.test(m)],
  ["A3 Playwright depth probe", "Does Talha have Playwright experience, or is it just listed as a skill?",
    (m) => /direct|documented|automation/i.test(m) && m.includes("Outbound")],
  ["A4 Interview questions (automation role)", "What should I ask Talha in an interview for an AI automation role?",
    (m) => /\d\./.test(m) && m.length > 200],
];
let pass = 0;
for (const [name, q, check] of tests) {
  const r = await fetch("http://localhost:3100/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: q, history: [] }),
  });
  const d = await r.json();
  const ok = d.ok && check(d.message ?? "");
  if (ok) pass++;
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) console.log("   got:", (d.message ?? JSON.stringify(d)).slice(0, 300));
}
console.log(`\n${pass}/4 acceptance tests pass`);
