import { IDENTITY, identityBlock, retrieveSections, compactProfile } from "./portfolio-knowledge";
import { findTechMentions } from "./tech-evidence";
import { quickAnswer, fallbackAnswer } from "./quick-answers";
import { localAnswer, genericGroundedAnswer } from "./local-reasoning";

/**
 * "Ask Talha" orchestration — LOCAL FIRST, LLMs AS REASONING ENHANCEMENTS.
 *
 * USER → instant curated answer → retrieval → Kimi ∥ GLM (raced in
 * parallel, first valid token wins, loser cancelled) → local portfolio
 * reasoning as the guaranteed final layer. A provider failure NEVER
 * becomes a user-facing failure: both providers failing still answers
 * from local evidence. Keys stay server-side.
 */

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatHints {
  intent?: string;
  techs?: string[];
}

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

const INTENTS: Intent[] = [
  "GENERAL_PORTFOLIO",
  "PROJECT_EXPLANATION",
  "TECHNOLOGY_QUERY",
  "EXPERIENCE_QUERY",
  "RECRUITER_FIT",
  "JOB_REQUIREMENT_ANALYSIS",
  "INTERVIEW_QUESTIONS",
  "CAREER_QUESTION",
  "CONTACT",
  "OUT_OF_SCOPE",
];

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
- Hiring/suitability questions: run a candidate fit analysis — identify ROLE and REQUIREMENTS, match each requirement to documented evidence with its strength, note gaps honestly, then give a clear recommendation. Strong evidence → confident yes. Missing evidence → say so. Never default to yes; never undersell when evidence is strong.
- Technology questions: state where and how it was used, and whether that's direct project evidence or just a toolkit listing.
- Conversational and concise: 2–5 sentences for simple questions; a short requirement-by-requirement breakdown when the visitor lists requirements; 150–300 words for fit analyses.
- Plain prose only: no markdown headers, no emoji.`;

/* ── providers ───────────────────────────────────────────────── */
interface Provider {
  name: "kimi" | "glm";
  model: string;
  key: string;
  baseUrl: string;
  /** provider-specific request body additions */
  extra?: Record<string, unknown>;
}

function envTimeout(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v >= 2000 && v <= 30000 ? v : fallback;
}

export function pickProviders(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.KIMI_API_KEY) {
    providers.push({
      name: "kimi",
      model: process.env.KIMI_MODEL || "kimi-k2-turbo-preview",
      key: process.env.KIMI_API_KEY,
      baseUrl: (process.env.KIMI_BASE_URL || "https://api.moonshot.ai/v1").replace(/\/$/, ""),
    });
  }
  if (process.env.GLM_API_KEY) {
    providers.push({
      name: "glm",
      model: process.env.GLM_MODEL || "glm-4.6",
      key: process.env.GLM_API_KEY,
      baseUrl: (process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4").replace(/\/$/, ""),
      // glm-4.6 runs a hidden reasoning pass by default (20-40s); disabling
      // it is what makes GLM competitive in the race
      extra: { thinking: { type: "disabled" } },
    });
  }
  return providers;
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
  for (const id of sectionIds) if (FOLLOWUP_POOLS[id]) return FOLLOWUP_POOLS[id];
  return FOLLOWUP_POOLS.identity;
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

/* ── OpenAI-compatible streaming (Kimi + GLM) ────────────────── */
async function* streamProvider(p: Provider, system: string, user: string, signal: AbortSignal): AsyncGenerator<string> {
  const res = await fetch(`${p.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
    body: JSON.stringify({
      model: p.model,
      temperature: 0.35,
      max_tokens: 500,
      stream: true,
      ...(p.extra ?? {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal,
  });
  if (!res.ok || !res.body)
    throw new Error(`${p.name.toUpperCase()} ${res.status}: ${(await res.text()).slice(0, 160)}`);

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

/* ── parallel provider race ──────────────────────────────────── */
/**
 * Fires every configured provider SIMULTANEOUSLY. The first provider
 * to produce a valid chunk wins the race; the losers are aborted so
 * their requests stop billing/burning. If every provider fails before
 * producing a token, rejects — the caller falls to local reasoning.
 */
async function startProviderRace(
  providers: Provider[],
  system: string,
  user: string,
  intent: string,
  failures: string[] = []
): Promise<{ provider: string; chunks: AsyncGenerator<string> }> {
  const attempts = providers.map((p) => {
    const ctrl = new AbortController();
    const timeoutMs = envTimeout(`${p.name.toUpperCase()}_TIMEOUT_MS`, 10000);
    const timer: { t: ReturnType<typeof setTimeout> | null } = { t: null };
    timer.t = setTimeout(() => ctrl.abort(), timeoutMs);
    const gen = streamProvider(p, system, user, ctrl.signal);
    return { p, ctrl, timer, gen, started: Date.now(), timeoutMs };
  });

  return new Promise((resolve, reject) => {
    let settled = false;
    let pending = attempts.length;

    const recordFailure = (a: (typeof attempts)[number], err: unknown) => {
      const aborted = a.ctrl.signal.aborted;
      const status = aborted && Date.now() - a.started >= a.timeoutMs - 250 ? "timeout" : "error";
      console.log(
        `[${a.p.name.toUpperCase()}] intent=${intent} model=${a.p.model} latency=${Date.now() - a.started}ms status=${status}${aborted ? "" : " :: " + String(err instanceof Error ? err.message : err).slice(0, 120)}`
      );
      failures.push(`${a.p.name.toUpperCase()} ${status}${aborted ? "" : ": " + String(err instanceof Error ? err.message : err).slice(0, 100)}`);
      if (!settled && --pending === 0) {
        settled = true;
        reject(new Error("all providers failed"));
      }
    };

    for (const a of attempts) {
      (async () => {
        try {
          const first = await a.gen.next();
          if (a.timer.t) clearTimeout(a.timer.t);
          if (settled) {
            // lost the race after producing — cancel this provider
            a.ctrl.abort();
            console.log(`[${a.p.name.toUpperCase()}] intent=${intent} model=${a.p.model} latency=${Date.now() - a.started}ms status=cancelled (lost race)`);
            return;
          }
          settled = true;
          console.log(`[${a.p.name.toUpperCase()}] intent=${intent} model=${a.p.model} latency=${Date.now() - a.started}ms status=success (won race)`);
          for (const b of attempts) {
            if (b === a) continue;
            if (b.timer.t) clearTimeout(b.timer.t);
            b.ctrl.abort();
            console.log(`[${b.p.name.toUpperCase()}] intent=${intent} model=${b.p.model} latency=${Date.now() - b.started}ms status=cancelled`);
          }
          // guard against a hung stream after winning: generous finish window
          let finishTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => a.ctrl.abort(), 25000);
          async function* winnerChunks() {
            try {
              if (first.value) yield first.value;
              for await (const chunk of a.gen) yield chunk;
            } finally {
              if (finishTimer) clearTimeout(finishTimer);
            }
          }
          resolve({ provider: a.p.name, chunks: winnerChunks() });
        } catch (err) {
          if (a.timer.t) clearTimeout(a.timer.t);
          recordFailure(a, err);
        }
      })();
    }
  });
}

export function streamAssistant(question: string, history: Turn[], hints?: ChatHints): ReadableStream<Uint8Array> {
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
      let emitted = false;

      try {
        /* ── INSTANT LAYER — curated answers, navigation, zero LLM ── */
        const ctx = history.slice(-2).map((h) => h.content).join(" ");
        const instant = quickAnswer(question, ctx);
        if (instant) {
          send({
            type: "meta",
            provider: "instant",
            fallback_used: false,
            retrieval_ms: 0,
            actions: instant.actions,
            follow_ups: instant.followUps,
          });
          emitted = true;
          send({ type: "delta", text: instant.text });
          send({
            type: "done",
            provider: "instant",
            fallback_used: false,
            total_ms: Date.now() - t0,
            follow_ups: instant.followUps,
          });
          console.log(`[INSTANT] total=${Date.now() - t0}ms`);
          return;
        }

        /* ── RETRIEVAL — local evidence before any network call ──── */
        const retrievalStart = Date.now();
        const intent: Intent =
          hints?.intent && INTENTS.includes(hints.intent as Intent)
            ? (hints.intent as Intent)
            : classifyIntent(question);
        const { evidence, sectionIds } = buildEvidence(question, history, intent);
        const retrievalMs = Date.now() - retrievalStart;
        const actions = deriveActions(sectionIds);
        const followUps = contextualFollowUps(sectionIds);

        const providers = pickProviders();
        send({
          type: "meta",
          provider: providers[0]?.name ?? "local",
          providers: providers.map((p) => p.name),
          fallback_used: false,
          retrieval_ms: retrievalMs,
          actions,
          follow_ups: followUps,
        });

        const system = `${SYSTEM_RULES}\n\nEVIDENCE (the only source of facts about Talha):\n${evidence}\n\nIdentity:\n${identityBlock()}`;
        const user = `VISITOR QUESTION: ${question}`;

        /* ── PARALLEL LLM RACE — Kimi ∥ GLM, first token wins ────── */
        const raceFailures: string[] = [];
        if (providers.length > 0) {
          try {
            const race = await startProviderRace(providers, system, user, intent, raceFailures);
            emitted = true;
            for await (const chunk of race.chunks) send({ type: "delta", text: chunk });
            send({
              type: "done",
              provider: race.provider,
              fallback_used: race.provider !== providers[0].name,
              total_ms: Date.now() - t0,
              follow_ups: followUps,
            });
            console.log(`[Portfolio AI] winner=${race.provider} retrieval=${retrievalMs}ms total=${Date.now() - t0}ms`);
            return;
          } catch (err) {
            console.log(`[RACE] intent=${intent} all providers failed → local reasoning (${err instanceof Error ? err.message : err})`);
            if (emitted) {
              send({ type: "done", provider: "partial", fallback_used: true, total_ms: Date.now() - t0, diag: raceFailures });
              return;
            }
          }
        }

        /* ── LOCAL REASONING — the guaranteed answer layer ────────── */
        const local =
          localAnswer(question) ??
          fallbackAnswer(question, ctx) ?? {
            text: genericGroundedAnswer().text,
            actions: genericGroundedAnswer().actions,
            followUps: genericGroundedAnswer().followUps,
          };
        send({
          type: "meta",
          provider: "local",
          providers: [],
          fallback_used: true,
          retrieval_ms: retrievalMs,
          actions: local.actions,
          follow_ups: local.followUps,
        });
        emitted = true;
        send({ type: "delta", text: local.text });
        send({
          type: "done",
          provider: "local",
          fallback_used: true,
          total_ms: Date.now() - t0,
          follow_ups: local.followUps,
          diag: raceFailures,
        });
        console.log(`[LOCAL] intent=${intent} total=${Date.now() - t0}ms`);
      } catch (err) {
        // absolutely last resort — still never a bare provider failure
        console.error("[Portfolio AI] unexpected failure:", err instanceof Error ? err.message : err);
        if (!emitted) {
          const g = genericGroundedAnswer();
          send({ type: "delta", text: g.text });
          send({ type: "done", provider: "local", fallback_used: true, total_ms: Date.now() - t0 });
        } else {
          send({ type: "done", provider: "partial", fallback_used: true, total_ms: Date.now() - t0 });
        }
      } finally {
        controller.close();
      }
    },
  });
}
