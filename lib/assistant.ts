import { IDENTITY, identityBlock, retrieveSections, compactProfile } from "./portfolio-knowledge";
import { findTechMentions } from "./tech-evidence";
import { quickAnswer } from "./quick-answers";

/**
 * "Ask Talha" orchestration — Gemini PRIMARY, GLM FALLBACK.
 *
 * Flow: question → intent → relevance retrieval → compact context →
 * Gemini (streamed) → on failure GLM → on both failing an honest
 * "temporarily unavailable" message. No canned substantive answers.
 */

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export class MissingKeyError extends Error {}

/* ── intent classification (retrieval routing only) ──────────── */
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
  const q = ` ${question.toLowerCase()} `;
  if (/what (should|could|would) (i|we|one) ask|interview questions|questions for (an|the) interview/i.test(question))
    return "INTERVIEW_QUESTIONS";
  if (/\b(hire|hiring|recruiter|candidate|shortlist|fit|suitable|qualified|recommend)\b/i.test(question))
    return "RECRUITER_FIT";
  if (/\b(job description|we need|we're hiring|we are hiring|requirements)\b/i.test(question) && /\b(ai|ml|full-?stack|engineer|developer|role|position|skills?)\b/i.test(question))
    return "JOB_REQUIREMENT_ANALYSIS";
  if (/\b(contact|reach|email)\b/.test(q)) return "CONTACT";
  if (/\b(experience|worked|career|intellimind|dev weekends|code alpha|teaching|assistant)\b/.test(q))
    return "EXPERIENCE_QUERY";
  if (/\b(pytorch|opencv|playwright|redis|fastapi|next|n8n|lime|bert|librosa|websocket|shopify|streamlit|llm|transformer|cnn|lstm|sklearn|technology|technologies|stack)\b/.test(q))
    return "TECHNOLOGY_QUERY";
  if (/\b(malaria|deepfake|news|commerce|voice|automation|monolayer|outbound)\b/.test(q)) return "PROJECT_EXPLANATION";
  if (/\b(who|about|bio|background|education|student|university)\b/.test(q)) return "GENERAL_PORTFOLIO";
  return "OUT_OF_SCOPE";
}

const SYSTEM_RULES = `You are "Ask Talha" — the Portfolio Intelligence Assistant on Muhammad Talha Qureshi's portfolio.

Use ONLY the EVIDENCE supplied below. Answer the visitor's actual question directly.

- Never invent technologies, employers, metrics, dates or experience. If the evidence doesn't cover something, say it can't be confirmed from the portfolio.
- Preserve metric qualifiers exactly: "held-out test set", "on-device benchmark", "local benchmark", "campaign comparison", "observed in lab trials", "field data after rebuild". Never upgrade a benchmark into a production claim.
- Distinguish documented facts from your assessment; present assessments as assessments.
- Hiring/suitability questions: run a candidate fit analysis — match each stated requirement to documented evidence with its strength, note gaps, then give a clear recommendation. Strong evidence → confident yes. Missing evidence → say so honestly. Never default to yes; never undersell when evidence is strong.
- Technology questions: state where and how it was used, and whether that's direct project evidence or just a toolkit listing.
- Conversational and concise: 2–5 sentences for simple questions; a short requirement-by-requirement breakdown when the visitor lists requirements; 150–300 words for fit analyses.
- Plain prose only: no markdown headers, no emoji.`;

/* ── providers ───────────────────────────────────────────────── */
interface GeminiProvider {
  name: "gemini";
  model: string;
  key: string;
  baseUrl: string;
}
interface GlmProvider {
  name: "glm";
  model: string;
  key: string;
  baseUrl: string;
}

export function pickProviders(): { gemini: GeminiProvider | null; glm: GlmProvider | null } {
  return {
    gemini: process.env.GEMINI_API_KEY
      ? {
          name: "gemini",
          model: process.env.GEMINI_MODEL || "gemini-3.7-flash",
          key: process.env.GEMINI_API_KEY,
          baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        }
      : null,
    glm: process.env.GLM_API_KEY
      ? {
          name: "glm",
          model: process.env.GLM_MODEL || "glm-4.6",
          key: process.env.GLM_API_KEY,
          baseUrl: (process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4").replace(/\/$/, ""),
        }
      : null,
  };
}

/* ── retrieval ───────────────────────────────────────────────── */
function buildEvidence(question: string, history: Turn[], intent: Intent): { evidence: string; sectionIds: string[] } {
  const broad =
    intent === "GENERAL_PORTFOLIO" ||
    intent === "JOB_REQUIREMENT_ANALYSIS" ||
    intent === "RECRUITER_FIT" ||
    intent === "INTERVIEW_QUESTIONS" ||
    /assess|overview|strongest|all projects|compare|across/i.test(question);

  const sections = retrieveSections(question, history.map((h) => h.content), broad);
  const blocks = sections.map((s) => `[${s.title.toUpperCase()}]\n${s.detail}`);

  // named technology requirements get their relationship-aware evidence
  const mentions = findTechMentions(question);
  if (mentions.length > 0) {
    blocks.push(
      "[NAMED TECHNOLOGY REQUIREMENTS — WITH DOCUMENTED EVIDENCE]\n" +
        mentions
          .map(
            (t) =>
              `${t.name} [${t.strength}] — ${t.evidence.map((e) => `${e.title}: ${e.how}`).join(" | ") || "toolkit listing only; no documented project use"}`
          )
          .join("\n")
    );
  }

  if (intent === "RECRUITER_FIT" || intent === "JOB_REQUIREMENT_ANALYSIS" || intent === "INTERVIEW_QUESTIONS") {
    blocks.push("[AI ENGINEERING FIT SUMMARY]\n" + compactProfile());
  }

  return { evidence: blocks.join("\n\n"), sectionIds: sections.map((s) => s.id) };
}

/* ── actions + follow-ups derived from retrieved evidence ────── */
export interface ChatAction {
  label: string;
  type: string;
  target?: string;
  /** navigation commands — the UI runs these automatically on receipt */
  auto?: boolean;
}

const SECTION_ACTIONS: Record<string, ChatAction> = {
  "featured-malaria": { label: "View the malaria case study →", type: "scroll_to_project", target: "malaria-case-study" },
  "outbound-automation": { label: "See the automation pipeline →", type: "scroll_to_project", target: "outbound-automation" },
  "deepfake-detection": { label: "View deepfake detection →", type: "scroll_to_project", target: "deepfake-detection" },
  "news-nlp": { label: "View the news analyzer →", type: "scroll_to_project", target: "news-nlp" },
  "b2b-commerce": { label: "View the commerce platform →", type: "scroll_to_project", target: "b2b-commerce" },
  "voice-pipeline": { label: "View the voice pipeline →", type: "scroll_to_project", target: "voice-pipeline" },
  experience: { label: "View experience →", type: "scroll_to", target: "experience" },
  expertise: { label: "Open the tech map →", type: "scroll_to", target: "expertise" },
  contact: { label: "Open the contact form →", type: "scroll_to", target: "contact" },
  notes: { label: "Read the engineering notes →", type: "scroll_to", target: "notes" },
  systems: { label: "Explore the system architectures →", type: "scroll_to", target: "systems" },
};

const FOLLOWUP_POOLS: Record<string, string[]> = {
  "featured-malaria": ["How does the monolayer detector work?", "What results did the system achieve?", "What was Talha's role?"],
  "outbound-automation": ["How does the outreach stay non-generic?", "What stack powers the site audits?", "How would the pipeline scale?"],
  "deepfake-detection": ["Why the hybrid Xception-LSTM?", "How does LIME explainability work?", "What accuracy was achieved?"],
  "news-nlp": ["How does the bias analysis work?", "How do 34 sources stay deduplicated?", "What models summarize the articles?"],
  "b2b-commerce": ["What is the headless architecture?", "How did Redis caching help LCP?", "How do approval flows work?"],
  "voice-pipeline": ["How is the latency budget managed?", "What does WebSockets handle?", "What was the round-trip latency?"],
  intellimind: ["What does he build at Intellimind?", "Does he have production AI experience?", "What backend stack does he use?"],
  experience: ["Does he have teaching experience?", "Where does he currently work?", "Has he worked with NLP?"],
  identity: ["What are his strongest projects?", "What technologies does he use?", "How can I contact him?"],
  "tech-evidence-index": ["Where has he used PyTorch?", "What's his strongest CV project?", "Does he have full-stack experience?"],
};

function contextualFollowUps(sectionIds: string[]): string[] {
  const out: string[] = [];
  for (const id of sectionIds) {
    const pool = FOLLOWUP_POOLS[id];
    if (!pool) continue;
    for (const f of pool) if (!out.includes(f) && out.length < 3) out.push(f);
  }
  if (out.length === 0)
    out.push("What does Talha specialize in?", "What are his strongest projects?", "How can I contact him?");
  return out.slice(0, 3);
}

function deriveActions(sectionIds: string[]): ChatAction[] {
  const out: ChatAction[] = [];
  for (const id of sectionIds) {
    const a = SECTION_ACTIONS[id];
    if (a && !out.some((x) => x.label === a.label)) out.push(a);
    if (out.length >= 2) break;
  }
  return out;
}

/* ── Gemini streaming call (SSE) ─────────────────────────────── */
async function* streamGeminiText(
  p: GeminiProvider,
  system: string,
  user: string,
  signal: AbortSignal
): AsyncGenerator<string> {
  const res = await fetch(
    `${p.baseUrl}/models/${p.model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": p.key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: user }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 700,
          // 3.x-flash cannot disable thinking (budget 0 → 400 INVALID_ARGUMENT);
          // 128 is the smallest accepted budget, capping the thinking pass
          thinkingConfig: { thinkingBudget: 128 },
        },
      }),
      signal,
    }
  );
  if (!res.ok || !res.body)
    throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 160)}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        const json = JSON.parse(line.slice(5).trim());
        const parts = json?.candidates?.[0]?.content?.parts ?? [];
        const text = parts
          .filter((part: { thought?: boolean }) => !part.thought)
          .map((part: { text?: string }) => part.text ?? "")
          .join("");
        if (text) yield text;
      } catch {
        /* ignore malformed SSE line */
      }
    }
  }
}

/* ── GLM fallback (streamed via OpenAI-compatible SSE) ───────── */
async function* streamGLM(
  p: GlmProvider,
  system: string,
  user: string,
  signal: AbortSignal
): AsyncGenerator<string> {
  const res = await fetch(`${p.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
    body: JSON.stringify({
      model: p.model,
      temperature: 0.35,
      max_tokens: 700,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal,
  });
  if (!res.ok || !res.body)
    throw new Error(`GLM ${res.status}: ${(await res.text()).slice(0, 160)}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const s = line.trim();
      if (!s.startsWith("data:")) continue;
      const payload = s.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const text = json?.choices?.[0]?.delta?.content;
        if (typeof text === "string" && text) yield text;
      } catch {
        /* ignore malformed SSE line */
      }
    }
  }
}

/* ── streaming orchestration ─────────────────────────────────── */
export function streamAssistant(question: string, history: Turn[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch {
          /* stream already closed */
        }
      };
      const t0 = Date.now();
      const retrievalStart = Date.now();

      try {
        // INSTANT PATH — ready-made, evidence-grounded answers for the
        // common questions and navigation commands. No retrieval, no LLM.
        const instant = quickAnswer(
          question,
          history.slice(-2).map((h) => h.content).join(" ")
        );
        if (instant) {
          send({
            type: "meta",
            provider: "instant",
            fallback_used: false,
            retrieval_ms: Date.now() - retrievalStart,
            actions: instant.actions,
            follow_ups: instant.followUps,
          });
          send({ type: "delta", text: instant.text });
          send({
            type: "done",
            provider: "instant",
            fallback_used: false,
            total_ms: Date.now() - t0,
            follow_ups: instant.followUps,
          });
          console.log(`[Portfolio AI] provider=instant total=${Date.now() - t0}ms`);
          return;
        }

        const intent = classifyIntent(question);
        const { evidence, sectionIds } = buildEvidence(question, history, intent);
        const retrievalMs = Date.now() - retrievalStart;
        const actions = deriveActions(sectionIds);
        const followUps = contextualFollowUps(sectionIds);

        const providers = pickProviders();
        const system = `${SYSTEM_RULES}\n\nEVIDENCE (the only source of facts about Talha):\n${evidence}\n\nIdentity:\n${identityBlock()}`;
        const user = `VISITOR QUESTION: ${question}`;

        send({
          type: "meta",
          provider: providers.gemini ? "gemini" : providers.glm ? "glm" : "none",
          fallback_used: false,
          retrieval_ms: retrievalMs,
          actions,
          follow_ups: followUps,
        });

        let usedFallback = false;
        const providerStart = Date.now();

        const emit = (chunk: string) => {
          send({ type: "delta", text: chunk });
        };

        if (providers.gemini) {
          try {
            // 12s: warm Gemini answers in 2–4s; free-tier capacity queueing
            // (or an exhausted daily pool) must bail to GLM quickly
            for await (const chunk of streamGeminiText(providers.gemini, system, user, abortSignal(12000))) {
              emit(chunk);
            }
          } catch (err) {
            if (!providers.glm) throw err;
            usedFallback = true;
            console.warn(`[Portfolio AI] gemini failed (${err instanceof Error ? err.message : err}) → glm fallback`);
            for await (const chunk of streamGLM(providers.glm, system, user, abortSignal(25000))) {
              emit(chunk);
            }
          }
        } else if (providers.glm) {
          usedFallback = true;
          for await (const chunk of streamGLM(providers.glm, system, user, abortSignal(25000))) {
            emit(chunk);
          }
        } else {
          throw new Error("No AI provider configured");
        }

        send({
          type: "done",
          provider: usedFallback ? "glm" : "gemini",
          fallback_used: usedFallback,
          total_ms: Date.now() - t0,
        });
        console.log(
          `[Portfolio AI] provider=gemini retrieval=${retrievalMs}ms provider_ms=${Date.now() - providerStart}ms total=${Date.now() - t0}ms fallback=${usedFallback}`
        );
      } catch (err) {
        console.error("[Portfolio AI] failed:", err instanceof Error ? err.message : err);
        send({
          type: "error",
          message:
            err instanceof MissingKeyError
              ? "The AI assistant isn't configured on this deployment yet."
              : "I'm temporarily unable to analyze the portfolio right now. Please try again in a moment.",
          detail: err instanceof Error ? err.message.slice(0, 160) : undefined,
        });
      } finally {
        controller.close();
      }
    },
  });
}

function abortSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}
