/* Acceptance suite — Part 16 TEST 1-7 + instant + nav, zero-key mode.
   With no KIMI_API_KEY/GLM_API_KEY present, every LLM-path question
   must still produce a useful answer via local portfolio reasoning. */
const ask = async (label, question, history = []) => {
  const t0 = Date.now();
  const r = await fetch("http://localhost:3100/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history, hints: {} }),
  });
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "", meta = null, done = null, full = "", err = null;
  while (true) {
    const { done: d, value } = await reader.read();
    if (d) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const l of lines) {
      if (!l.startsWith("data:")) continue;
      try {
        const ev = JSON.parse(l.slice(5));
        if (ev.type === "meta") meta = ev;
        if (ev.type === "delta") full += ev.text;
        if (ev.type === "done") done = ev;
        if (ev.type === "error") err = ev;
      } catch {}
    }
  }
  const verdict = err ? "!! ERROR-EVENT" : "ok";
  console.log(
    `${label}: ${Date.now() - t0}ms provider=${meta?.provider} fallback=${done?.fallback_used} ${verdict}`
  );
  console.log("   " + (full || err?.message || "EMPTY").slice(0, 150).replace(/\n/g, " "));
  if (err) process.exitCode = 1;
};

(async () => {
  console.log("── Part 16 required tests (zero LLM keys → local reasoning) ──");
  await ask("T1 recruiter R+P ", "I'm a recruiter looking to hire an AI engineer. We need someone with Redis and Playwright.");
  await ask("T2 playwright ev ", "Does Talha actually know Playwright or is it just listed?");
  await ask("T3 redis evidence", "Does he have Redis experience?");
  await ask("T4 ai-automation  ", "Should I hire Talha for an AI automation role?");
  await ask("T5 impossible JD  ", "We need 8 years of AWS, Kubernetes and distributed GPU training.");
  await ask("T6 interview qs   ", "What should I ask Talha in an AI engineer interview?");
  await ask("T7 strongest      ", "What are Talha's strongest areas?");
  console.log("── instant layer + navigation ──");
  await ask("T8 suggestion     ", "What does Talha specialize in?");
  await ask("T9 nav            ", "take me to his malaria project");
  await ask("T10 unique pitch  ", "what unique thing talha bring so that i should hire him");
  console.log("── never-unavailable probes ──");
  await ask("T11 odd phrasing  ", "would this person be a good add to a computer vision team?");
  await ask("T12 pure nonsense ", "zzz qqq xyzzy?");
})();
