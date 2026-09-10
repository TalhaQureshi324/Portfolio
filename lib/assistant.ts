import {
  ALL_ENTRIES,
  CONTACT_ACTIONS,
  PORTFOLIO_VOCAB,
  TOOLKIT_ONLY,
  type ChatAction,
  type KnowledgeEntry,
} from "./knowledge";

/**
 * "Ask Talha" engine — deterministic retrieval over the structured
 * portfolio knowledge. Composes answers ONLY from presented facts,
 * attaches metric qualifiers, resolves follow-up context, and emits
 * actions from a strict allowlist. Works with zero API keys.
 */

export interface Turn {
  role: "user" | "assistant";
  content: string;
}
export interface AssistantAnswer {
  message: string;
  actions: ChatAction[];
  followUps: string[];
  topic?: string;
  source: "local" | "llm";
}

/* ── allowlist ───────────────────────────────────────────────── */
const SCROLL_TARGETS = new Set([
  "work", "malaria-case-study", "systems", "notes", "about", "experience",
  "expertise", "contact", "top",
  "outbound-automation", "deepfake-detection", "news-nlp", "b2b-commerce", "voice-pipeline",
]);
const ACTION_TYPES = new Set(["scroll_to", "resume", "email", "github", "linkedin", "contact_form"]);

export function sanitizeActions(actions: ChatAction[]): ChatAction[] {
  return actions
    .filter((a) => ACTION_TYPES.has(a.type))
    .filter((a) => a.type !== "scroll_to" || (a.target && SCROLL_TARGETS.has(a.target)))
    .slice(0, 3);
}

/* ── normalization & context ─────────────────────────────────── */
const norm = (s: string) =>
  " " + s.toLowerCase().replace(/[^a-z0-9\s.\/+-]/g, " ").replace(/\s+/g, " ").trim() + " ";

const PROJECT_TOPIC_KEYWORDS: Record<string, string[]> = {
  malaria: ["malaria", "monolayer", "parasite", "parasitemia", "microscope", "slide", "blood", "biomedical"],
  automation: ["automation", "outbound", "outreach", "lead", "leads", "audit", "n8n", "instantly", "email engine"],
  deepfake: ["deepfake", "deepfakes", "fake", "xception", "lstm", "forensic"],
  news: ["news", "bias", "media", "summarization", "summarisation"],
  commerce: ["commerce", "shopify", "storefront", "b2b", "wholesale"],
  voice: ["voice", "audio", "speech", "conversion"],
  identity: ["who", "talha", "background", "about"],
  contact: ["contact", "email", "reach", "hire"],
};

function resolveLastTopic(history: Turn[]): string | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const t = history[i];
    if (t.role !== "user") continue;
    const n = norm(t.content);
    for (const [topic, kws] of Object.entries(PROJECT_TOPIC_KEYWORDS)) {
      if (kws.some((k) => n.includes(` ${k} `) || n.includes(`${k}`))) return topic;
    }
    return undefined; // stop at the most recent user message without a topic
  }
  return undefined;
}

const FOLLOWUP_SIGNALS = /\b(he|his|him|it|its|that|this|those|they|them|their|more|also|else|again|why|how|what|which|and)\b/;
const CODING_REQUEST =
  /\b(write|make|build|create|generate|give|show)\b[^.?!]*\b(code|program|script|algorithm|function|snippet|array|app|website|website for me)\b|\bsort(s|ing)?\b[^.?!]*\b(array|list|numbers)\b|\bleetcode\b|\bfizzbuzz\b/;
const GREETING = /^(hi|hii+|hello+|hey+|yo|salam|assalam)[\s!.?]*$/;
const THANKS = /\b(thanks|thank you|thx|shukriya)\b/;

/* ── scoring ─────────────────────────────────────────────────── */
function scoreEntry(entry: KnowledgeEntry, q: string): number {
  let score = 0;
  for (const kw of entry.keywords) {
    const k = kw.toLowerCase();
    if (q.includes(` ${k} `) || q.includes(` ${k}`) || q.includes(`${k} `)) {
      score += 2 + Math.min(k.length, 12) / 6;
    } else if (k.length > 4 && q.includes(k)) {
      score += 1.5;
    }
  }
  return score;
}

/* ── redirection templates ───────────────────────────────────── */
const REDIRECT: AssistantAnswer = {
  message:
    "I'm Talha's portfolio assistant, so I'm mainly here to answer questions about his work — projects, technical background, experience and how to reach him. Ask me about any of the systems on this page, or what he specializes in.",
  actions: [
    { label: "View selected work →", type: "scroll_to", target: "work" },
    { label: "What does Talha specialize in?", type: "scroll_to", target: "expertise" },
  ],
  followUps: ["What does Talha specialize in?", "What are his AI projects?", "How can I contact him?"],
  source: "local",
};

function cannotConfirm(askedAbout: string): AssistantAnswer {
  return {
    message: `${askedAbout} isn't something I can confidently confirm from the portfolio information available to me — and I'd rather not guess. What I can speak to is the work presented here: computer vision, NLP, automation, full-stack development, and the documented tools across Talha's six projects.`,
    actions: [
      { label: "Open the tech map →", type: "scroll_to", target: "expertise" },
      { label: "View selected work →", type: "scroll_to", target: "work" },
    ],
    followUps: ["What technologies does he work with?", "What are his AI projects?", "How can I contact him?"],
    source: "local",
  };
}

/* ── main entry ──────────────────────────────────────────────── */
export function answerQuestion(question: string, history: Turn[]): AssistantAnswer {
  const q = norm(question);
  const lastTopic = resolveLastTopic(history);

  // 1 — greetings / thanks (short, no portfolio signal)
  if (GREETING.test(question.trim())) {
    return {
      message:
        "Hello — I'm Talha's portfolio assistant. Ask me about his projects, technical background, experience, or how to reach him.",
      actions: [
        { label: "What does Talha specialize in?", type: "scroll_to", target: "expertise" },
        { label: "View selected work →", type: "scroll_to", target: "work" },
      ],
      followUps: ["What does Talha specialize in?", "Tell me about the malaria project.", "How can I contact him?"],
      source: "local",
    };
  }
  if (THANKS.test(q) && q.split(" ").length <= 4) {
    return {
      message: "You're welcome. If you want to keep exploring: the engineering notes explain the reasoning behind the systems, and the contact form reaches Talha directly.",
      actions: [
        { label: "Engineering notes →", type: "scroll_to", target: "notes" },
        { label: "Open the contact form →", type: "scroll_to", target: "contact" },
      ],
      followUps: ["What are his AI projects?", "Is he available for work?"],
      source: "local",
    };
  }

  // 2 — general coding / non-portfolio request (portfolio signals override)
  const portfolioSignal =
    /\b(talha|qureshi|his|him|he|portfolio|project|projects|malaria|deepfake|automation|commerce|voice|news|experience|resume|cv|expertise|skill|skills|hire|hiring|contact|available)\b/.test(q);
  if (CODING_REQUEST.test(q) && !(portfolioSignal && /\b(talha|his|portfolio|project)\b/.test(q))) {
    return {
      message:
        "I'm focused on answering questions about Talha's portfolio and work — I'm not a general-purpose coding assistant. If you'd like, I can explain where he has used Python or PyTorch, or walk you through one of his systems.",
      actions: [
        { label: "View selected work →", type: "scroll_to", target: "work" },
        { label: "What does Talha specialize in?", type: "scroll_to", target: "expertise" },
      ],
      followUps: ["Where has he used PyTorch?", "What are his AI projects?"],
      source: "local",
    };
  }

  // 2b — professional-experience probes about unevidenced tools must
  // hit the honest cannot-confirm path before generic entries match
  if (/\b(worked|working|work|experience|professional|professionally|production|deployed)\b/.test(q)) {
    const unevidenced = TOOLKIT_ONLY.find((t) => q.includes(t.toLowerCase()));
    if (unevidenced) return cannotConfirm(unevidenced);
  }

  // 3 — score entries
  const scored = ALL_ENTRIES.map((e) => ({ e, s: scoreEntry(e, q) })).sort((a, b) => b.s - a.s);
  let best = scored[0];

  // follow-up resolution: short/pronoun questions continue the last topic
  const followUpSignal = FOLLOWUP_SIGNALS.test(q) || q.split(" ").filter(Boolean).length <= 5;
  if (lastTopic && followUpSignal) {
    const topical = ALL_ENTRIES.filter((e) => e.topic === lastTopic);
    for (const t of topical) {
      const s = scoreEntry(t, q);
      if (best.e.topic !== lastTopic && s + 5 > best.s) best = { e: t, s: s + 5 };
    }
  }

  // 4 — insufficient signal
  const vocabHit = q.split(" ").some((w) => w.length > 2 && PORTFOLIO_VOCAB.has(w));
  if (best.s < 2) {
    if (!vocabHit && !portfolioSignal) return REDIRECT;
    // asked about a specific tool that isn't evidenced?
    const askedTool = TOOLKIT_ONLY.find((t) => q.includes(t.toLowerCase()));
    if (askedTool) return cannotConfirm(askedTool);
    return cannotConfirm("That specific detail");
  }

  // 5 — answer with metric contexts preserved
  const e = best.e;
  return {
    message: e.message,
    actions: sanitizeActions(e.actions),
    followUps: e.followUps,
    topic: e.topic,
    source: "local",
  };
}

/* ── optional LLM enhancement (server-side only) ───────────────
   If GEMINI_API_KEY or OPENAI_API_KEY is set, the engine's retrieval
   context is passed to the LLM for more natural phrasing. The local
   answer above remains the deterministic fallback and the action
   allowlist still applies to LLM output. */
export async function answerWithLLM(
  question: string,
  history: Turn[],
  knowledgeContext: string
): Promise<AssistantAnswer | null> {
  const base = answerQuestion(question, history);
  const gemini = process.env.GEMINI_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  if (!gemini && !openai) return null;

  const system = `You are "Ask Talha" — the portfolio assistant on Muhammad Talha Qureshi's portfolio website.
Rules:
- Answer ONLY from the PORTFOLIO CONTEXT below. If something isn't there, say you can't confirm it from the portfolio.
- Never invent employers, clients, metrics, technologies, dates or achievements.
- Keep metric qualifiers exactly as written (e.g. "96.8% detection sensitivity — held-out test set").
- Speak about Talha in third person; you are his portfolio assistant, not Talha.
- Be concise and technically precise. No marketing fluff.
- Off-topic questions: politely redirect to Talha's work. Never write code or answer general questions.
- Reply with STRICT JSON: {"message": string, "labels": string[]} where labels are up to 2 short action labels EXACTLY chosen from: ${JSON.stringify(base.actions.map((a) => a.label))} (or [] if none fit).

PORTFOLIO CONTEXT:
${knowledgeContext}

RECENT CONVERSATION:
${history.slice(-6).map((t) => `${t.role}: ${t.content}`).join("\n") || "(none)"}

QUESTION: ${question}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let text = "";
    if (gemini) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemini}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: system }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
          }),
          signal: controller.signal,
        }
      );
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openai}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 400,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: system }],
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      text = data?.choices?.[0]?.message?.content ?? "";
    }
    clearTimeout(timer);

    const json = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (typeof json.message !== "string" || json.message.length < 8) return null;
    const labels: string[] = Array.isArray(json.labels) ? json.labels.slice(0, 2) : [];
    const actions = base.actions.filter((a) => labels.includes(a.label));
    return { message: json.message, actions, followUps: base.followUps, topic: base.topic, source: "llm" };
  } catch {
    return null; // graceful fallback to the deterministic answer
  }
}
