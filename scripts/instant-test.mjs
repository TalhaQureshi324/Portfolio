/* Quick verification of the instant-answer + navigation paths. */
const ask = async (label, question, history = []) => {
  const t0 = Date.now();
  const r = await fetch("http://localhost:3100/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
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
  const auto = (meta?.actions || []).find((a) => a.auto);
  console.log(
    `${label}: ${Date.now() - t0}ms provider=${meta?.provider} actions=${(meta?.actions || []).length}` +
      (auto ? ` AUTO=${auto.type}:${auto.target}` : "") +
      ` followups=${(meta?.follow_ups || []).length} total_ms=${done?.total_ms}`
  );
  console.log("   " + (full || err?.message || "EMPTY").slice(0, 120).replace(/\n/g, " "));
};

const malariaText =
  "The malaria screening system is Talha's featured final-year project. It reads a live microscope feed and screens for Plasmodium parasites.";

(async () => {
  await ask("T1 suggestion ", "What does Talha specialize in?");
  await ask("T2 nav        ", "take me to his malaria project");
  await ask("T3 chip-mono  ", "How does the monolayer detector work?");
  await ask("T4 ctx-follow ", "What results did the system achieve?", [
    { role: "user", content: "Tell me about the malaria project." },
    { role: "assistant", content: malariaText },
  ]);
  await ask("T5 nav-resume ", "open his resume");
  await ask("T6 recruiter  ", "Should I hire Talha for a role needing Redis and Playwright?");
  await ask("T7 nav-contact", "take me to the contact section");
})();
