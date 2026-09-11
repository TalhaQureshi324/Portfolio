import {
  ALL_ENTRIES,
  CONTACT_ACTIONS,
  EVIDENCE_ACTIONS as A,
  PORTFOLIO_VOCAB,
  TOOLKIT_ONLY,
  type ChatAction,
  type KnowledgeEntry,
} from "./knowledge";
import { findTechMentions } from "./tech-evidence";

/**
 * "Ask Talha" engine — deterministic retrieval over the structured
 * portfolio knowledge. Composes answers ONLY from presented facts,
 * attaches metric qualifiers, resolves follow-up context, and emits
 * actions from a strict allowlist. Works with zero API keys.
 *
 * Intent model: RECRUITER_FIT / JOB_REQUIREMENT_ANALYSIS questions
 * get a requirement-by-requirement fit analysis (evidence strength
 * per requirement, gaps, recommendation) instead of a biography —
 * and the analysis can honestly conclude "not enough evidence".
 */

export type Turn = { role: "user" | "assistant"; content: string };
export interface AssistantAnswer {
  message: string;
  actions: ChatAction[];
  followUps: string[];
  topic?: string;
  source: "local" | "llm";
}

const FIT_SIGNAL =
  /\b(hire|hiring|recruiter|candidate|shortlist|fit|fitted|suitable|suited|qualified|qualify|recommend (him|talha|interviewing))\b/i;
const ROLE_SIGNAL = /\b(ai|ml|machine learning|full-?stack|frontend|backend|automation|engineer|developer|role|position|job)\b/i;
const INTERVIEW_Q = /what (should|could|would) (i|we|one) ask|interview questions|ask (him|talha) in (an|the) interview|questions for (an|the) interview/i;
const SENIORITY = /\b(senior|lead|principal|staff)\b|\b[3-9]\+?\s*years\b|years of (production |professional |engineering )?experience/i;

const GENERIC_REQUIREMENT_GAPS: Array<{ name: string; note: string }> = [
  { name: "years of production experience", note: "the portfolio documents projects and roles but doesn't independently establish years-of-experience claims" },
  { name: "production scale", note: "portfolio projects document measured results, but production traffic/scale isn't quantified on this page" },
  { name: "distributed training / GPU infrastructure", note: "not documented in the portfolio" },
  { name: "team leadership", note: "mentoring is documented (Dev Weekends, TA roles), but formal team leadership isn't" },
];

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

/* ── intent classification ───────────────────────────────────── */
export type Intent =
  | "GENERAL_PORTFOLIO"
  | "PROJECT_EXPLANATION"
  | "TECHNOLOGY_QUERY"
  | "EXPERIENCE_QUERY"
  | "RECRUITER_FIT"
  | "JOB_REQUIREMENT_ANALYSIS"
  | "INTERVIEW_QUESTIONS"
  | "CAREER_QUESTION"
  | "CONTACT"
  | "OUT_OF_SCOPE";

export function classifyIntent(question: string): Intent {
  const q = norm(question);
  if (INTERVIEW_Q.test(question)) return "INTERVIEW_QUESTIONS";
  const fit =
    FIT_SIGNAL.test(question) ||
    (/\b(we need|we're hiring|we are hiring|we're looking|we are looking|job description|requirements?|role)\b/i.test(question) &&
      ROLE_SIGNAL.test(question));
  if (fit && (/\b(hire|candidate|interview|fit|suitable|qualified|recommend|shortlist)\b/i.test(question) || /\bwe need\b|\bwe're hiring\b|\bwe are hiring\b/i.test(question))) {
    return q.includes("job description") || q.split(" ").length > 25
      ? "JOB_REQUIREMENT_ANALYSIS"
      : "RECRUITER_FIT";
  }
  if (/\b(contact|reach|email)\b/.test(q)) return "CONTACT";
  if (/\b(experience|worked|career|intellimind|dev weekends|code alpha|teaching|ta)\b/.test(q)) return "EXPERIENCE_QUERY";
  if (/\b(pytorch|opencv|playwright|redis|fastapi|next|n8n|lime|bert|librosa|websocket|shopify|streamlit|llm|transformer|bert|cnn|lstm|sklearn|scikit)\b/.test(q))
    return "TECHNOLOGY_QUERY";
  if (/\b(malaria|deepfake|news|commerce|voice|automation|monolayer|outbound)\b/.test(q)) return "PROJECT_EXPLANATION";
  if (/\b(who|about|bio|background|student|education|university)\b/.test(q)) return "GENERAL_PORTFOLIO";
  return "OUT_OF_SCOPE";
}

/* ── recruiter fit analysis (deterministic, evidence-based) ──── */
function fitAnalysis(question: string): AssistantAnswer {
  const senior = SENIORITY.test(question);
  const mentions = findTechMentions(question);
  const direct = mentions.filter((m) => m.strength === "DIRECT_PROJECT" || m.strength === "DIRECT_EXPERIENCE");
  const weak = mentions.filter((m) => m.strength === "TOOLKIT_ONLY");
  const undocumented = mentions.filter((m) => m.strength === "NOT_DOCUMENTED");

  const lines: string[] = [];
  const actions: ChatAction[] = [];
  let verdict: string;

  if (direct.length > 0 && weak.length + undocumented.length === 0) {
    verdict = "Strong match — worth interviewing.";
  } else if (direct.length > 0 && weak.length + undocumented.length <= direct.length) {
    verdict = "Promising match — the strong requirements are covered directly, the rest are worth validating in an interview.";
  } else if (direct.length > 0) {
    verdict = "Partially covered — some requirements have direct evidence, others aren't established in the portfolio.";
  } else {
    verdict =
      "The portfolio doesn't provide strong enough evidence for these specific requirements — I wouldn't make a hiring recommendation on the portfolio alone.";
  }

  if (mentions.length === 0) {
    // generic fit question with no named technologies
    lines.push(
      "Verdict: Strong match for applied AI/ML and full-stack roles.",
      "",
      "Why:"
    );
    const generic: Array<[string, string]> = [
      ["AI engineering", "Documented across computer vision (malaria screening, deepfake detection), NLP (news analyzer, Intellimind assistants) and LLM-driven automation."],
      ["Backend & infrastructure", "FastAPI services, Redis caching, WebSocket streaming across documented projects; backend services at Intellimind."],
      ["Automation", "The outbound engine is an end-to-end n8n + Python pipeline with zero human steps."],
      ["Full-stack delivery", "Headless commerce (Next.js + Shopify Liquid) and the interface layers of every project here."],
    ];
    for (const [k, v] of generic) lines.push(`✓ ${k} — ${v}`);
    if (senior)
      lines.push(
        "",
        "Note on seniority: the portfolio shows strong applied breadth, but it doesn't independently establish senior-level production scale — I'd validate that in an interview rather than claim it from this page."
      );
    lines.push("", "Next step: interview — that's also where role-specific depth gets validated.");
    actions.push(A.automation, A.cv, A.contact);
  } else {
    lines.push("Verdict: " + verdict, "", "Requirement-by-requirement:");
    for (const m of direct) {
      const ev = m.evidence[0];
      const extra = m.evidence.length > 1 ? ` Also used in ${m.evidence[1].title}.` : "";
      lines.push(`✓ ${m.name} — Direct project evidence: ${ev.how}${extra ? ` ${extra}` : ""}`);
      const target = m.evidence.find((e) => e.target)?.target;
      if (target && actions.length < 3) {
        const found = [A.automation, A.deepfake, A.news, A.commerce, A.malaria, A.experience].find((a) => a.target === target);
        if (found && !actions.some((a) => a.label === found.label)) actions.push(found);
      }
    }
    for (const m of weak)
      lines.push(`• ${m.name} — Listed in his toolkit, but no documented project on this page ties it to specific work.`);
    for (const m of undocumented)
      lines.push(`✗ ${m.name} — Not established in the portfolio; I can't confidently verify professional experience with it.`);

    lines.push(
      "",
      "Broader AI engineering fit: the portfolio documents applied AI across computer vision, NLP and automation, plus backend services and FastAPI pipelines at Intellimind."
    );
    if (senior)
      lines.push(
        "",
        "On seniority: the portfolio establishes applied breadth, but it doesn't independently establish senior-level production scale or team leadership — that's an interview question, not something this page can confirm."
      );
    lines.push("", "Next step: " + (verdict.startsWith("Strong") ? "interview — worth validating depth and role-specific architecture there." : "interview only if the weaker requirements are non-critical for the role."));

    if (!actions.some((a) => a.type === "contact_form")) actions.push(A.contact);
  }

  return {
    message: lines.join("\n"),
    actions: sanitizeActions(actions),
    followUps: ["What are his strongest AI projects?", "What technologies does he work with?", "How can I contact him?"],
    topic: "fit",
    source: "local",
  };
}

/* ── interview question generator (from documented evidence) ─── */
const INTERVIEW_POOL: Record<string, string[]> = {
  malaria: [
    "How did you design the monolayer detection pipeline, and what made it the right first stage?",
    "What constrained the <60ms per-frame latency target, and how did you hold it?",
    "How did you validate the 96.8% sensitivity result on the held-out set?",
  ],
  automation: [
    "How does the outreach stay audit-grounded rather than templated?",
    "How would you scale the n8n pipeline if lead volume doubled?",
    "What did the 4.8× reply-rate comparison control for?",
  ],
  deepfake: [
    "Why Xception-LSTM rather than a single transformer model?",
    "How does the LIME attribution hold up under expert review?",
    "How was the FaceForensics++ benchmark set up?",
  ],
  commerce: [
    "How did Redis caching change the LCP profile for wholesale sessions?",
    "How do B2B approval flows work in the headless portal?",
  ],
  news: [
    "How is the 91% cluster purity measured?",
    "How do 34 live sources stay deduplicated?",
  ],
  voice: [
    "What does the <120ms latency budget force you to optimize first?",
    "How does overlap-add windowing keep artifacts out?",
  ],
  general: [
    "Walk me through a design decision you changed midway — what triggered it?",
    "How do you decide what belongs in the model versus the API layer?",
    "How do you validate a metric before putting it in front of stakeholders?",
  ],
};

function interviewQuestions(question: string): AssistantAnswer {
  const mentions = findTechMentions(question);
  const pools: string[] = [];
  const actions: ChatAction[] = [];
  const role = question.toLowerCase();

  if (/automation|n8n|outreach|outbound/.test(role)) {
    pools.push(...INTERVIEW_POOL.automation);
    actions.push(A.automation);
  }
  if (/vision|image|malaria|biomedical/.test(role)) {
    pools.push(...INTERVIEW_POOL.malaria);
    actions.push(A.malaria);
  }
  if (/deepfake|video|explainab/.test(role)) {
    pools.push(...INTERVIEW_POOL.deepfake);
    actions.push(A.deepfake);
  }
  if (/commerce|shopify|full-?stack|web/.test(role)) {
    pools.push(...INTERVIEW_POOL.commerce);
    actions.push(A.commerce);
  }
  for (const m of mentions) {
    for (const ev of m.evidence) {
      if (ev.target === "malaria-case-study") pools.push(...INTERVIEW_POOL.malaria);
      if (ev.target === "outbound-automation") pools.push(...INTERVIEW_POOL.automation);
      if (ev.target === "deepfake-detection") pools.push(...INTERVIEW_POOL.deepfake);
    }
  }
  if (pools.length === 0) pools.push(...INTERVIEW_POOL.general, ...INTERVIEW_POOL.malaria, ...INTERVIEW_POOL.automation);

  // dedupe, take 5
  const questions = [...new Set(pools)].slice(0, 5);
  const message =
    "Based on what's documented in the portfolio, these are the questions I'd explore:\n\n" +
    questions.map((qq, i) => `${i + 1}. ${qq}`).join("\n") +
    "\n\nEach one maps to real work on this page — his answers will show whether the depth matches the write-up.";
  return {
    message,
    actions: sanitizeActions(
      actions.length ? actions : [{ label: "View selected work →", type: "scroll_to", target: "work" }]
    ),
    followUps: ["What are his strongest AI projects?", "How can I contact him?", "What does Talha specialize in?"],
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

  // 2c — recruiter fit analysis & interview question generation
  if (INTERVIEW_Q.test(question)) return interviewQuestions(question);
  if (
    FIT_SIGNAL.test(question) ||
    (/\b(we need|we're hiring|we are hiring|we're looking|we are looking|job description)\b/i.test(question) && ROLE_SIGNAL.test(question))
  ) {
    return fitAnalysis(question);
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

  // circuit breaker: skip the LLM for a few minutes after repeated
  // failures (quota exhausted / model retired) so visitors never wait
  // on a guaranteed-failure request — the local engine answers instead.
  const now = Date.now();
  llmFailures = llmFailures.filter((t) => now - t < 5 * 60 * 1000);
  if (llmFailures.length >= 3) return null;

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
      // try current Gemini models in order (Google retires models over time)
      const models = [process.env.GEMINI_MODEL || "gemini-2.0-flash", "gemini-1.5-flash"];
      let data: any = null;
      let lastErr: unknown = null;
      for (const model of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gemini}`,
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
          if (!res.ok) {
            lastErr = `${res.status}`;
            continue;
          }
          data = await res.json();
          break;
        } catch (err) {
          lastErr = err;
        }
      }
      if (!data) throw lastErr ?? new Error("gemini failed");
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
    llmFailures = [];
    return { message: json.message, actions, followUps: base.followUps, topic: base.topic, source: "llm" };
  } catch {
    llmFailures.push(Date.now());
    return null; // graceful fallback to the deterministic answer
  }
}

let llmFailures: number[] = [];
