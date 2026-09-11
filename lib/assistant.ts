import { IDENTITY, identityBlock, retrieveSections, compactProfile } from "./portfolio-knowledge";
import { findTechMentions } from "./tech-evidence";

/**
 * "Ask Talha" orchestration — UNDERSTAND → RETRIEVE → ANALYZE → ANSWER.
 *
 * The LLM (GLM preferred, Gemini secondary) is the reasoning engine;
 * the structured portfolio knowledge is the only source of facts.
 * There are NO canned substantive answers: if the LLM layer is
 * unavailable the endpoint reports it honestly.
 */

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

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

export class MissingKeyError extends Error {
  constructor() {
    super("No LLM provider configured on the server (set GLM_API_KEY or GEMINI_API_KEY).");
  }
}

export interface AssistantResult {
  message: string;
  actions: Array<{ type: string; target?: string; label: string }>;
  followUps: string[];
  meta: { provider: string; model: string; intent: string };
}

/* ── intent classification (retrieval/routing only) ──────────── */
export function classifyIntent(question: string): Intent {
  const q = ` ${question.toLowerCase()} `;
  if (/what (should|could|would) (i|we|one) ask|interview questions|questions for (an|the) interview/i.test(question))
    return "INTERVIEW_QUESTIONS";
  if (/\b(hire|hiring|recruiter|candidate|shortlist|fit|suitable|qualified|recommend)\b/i.test(question))
    return "RECRUITER_FIT";
  if (/\b(job description|we need|we're hiring|we are hiring|requirements)\b/i.test(question) && ROLE_HINT.test(question))
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

const ROLE_HINT = /\b(ai|ml|machine learning|full-?stack|frontend|backend|automation|engineer|developer|role|position|job|skills?|technolog)/i;

/* ── provider selection ──────────────────────────────────────── */
interface GlmProvider {
  name: "glm";
  model: string;
  key: string;
}
interface GeminiProvider {
  name: "gemini";
  model: string;
  key: string;
}
type ProviderInfo = GlmProvider | GeminiProvider;

export function pickProvider(): ProviderInfo {
  if (process.env.GLM_API_KEY)
    return { name: "glm", model: process.env.GLM_MODEL || "glm-4.6", key: process.env.GLM_API_KEY };
  if (process.env.GEMINI_API_KEY)
    return { name: "gemini", model: process.env.GEMINI_MODEL || "gemini-2.0-flash", key: process.env.GEMINI_API_KEY };
  throw new MissingKeyError();
}

/* ── retrieval ───────────────────────────────────────────────── */
function buildEvidence(question: string, history: Turn[], intent: Intent): string {
  const broad =
    intent === "GENERAL_PORTFOLIO" ||
    intent === "JOB_REQUIREMENT_ANALYSIS" ||
    intent === "RECRUITER_FIT" ||
    /assess|overview|strongest|all projects|compare|across/i.test(question);

  const sections = retrieveSections(question, history.map((h) => h.content), broad);
  const blocks = sections.map((s) => `[${s.title.toUpperCase()}]\n${s.detail}`);

  // explicit requirement matches for recruiter/fit questions
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

  return blocks.join("\n\n");
}

/* ── system prompt ───────────────────────────────────────────── */
const JSON_CONTRACT = `OUTPUT: strict JSON only, no markdown fences:
{"message": string, "actions": [{"type": string, "target": string}], "follow_ups": [string, string, string]}
- "message": your complete answer, written for the visitor.
- "actions": 0–2 objects, ONLY with these exact "type" values:
    "scroll_to_project"  (target: "malaria" | "automation" | "deepfake" | "news" | "commerce" | "voice")
    "scroll_to_experience" | "scroll_to_expertise" | "scroll_to_contact" | "scroll_to_notes" | "scroll_to_systems"
    "open_resume" | "open_github" | "open_linkedin" | "open_email"
  Include only actions relevant to the answer — usually one or two, not a fixed footer.`;

const SYSTEM_RULES = `You are "Ask Talha" — the Portfolio Intelligence Assistant embedded in Muhammad Talha Qureshi's portfolio.

Your job is to answer the visitor's ACTUAL question by reasoning over the documented portfolio evidence supplied below. You are not a generic assistant and not a portfolio summarizer.

Hard rules:
- Facts about Talha come ONLY from the EVIDENCE block. If the evidence doesn't establish something, say explicitly that it can't be confirmed from the portfolio. Never use general world knowledge to fill gaps about Talha.
- Never invent employers, clients, technologies, metrics, years, production scale, achievements or results.
- Preserve metric qualifiers exactly: "held-out test set", "on-device benchmark", "local benchmark", "campaign comparison", "observed in lab trials", "field data after rebuild". Never upgrade a benchmark into a production claim.
- Distinguish FACT (documented evidence) from ASSESSMENT (your reasoning about that evidence). Present assessments as assessments.
- Speak about Talha in the third person. You are his portfolio assistant, not Talha himself.
- Tone: calm, technically precise, confident, honest. No marketing fluff, no overselling, no hedging when the evidence is strong.

Reasoning behavior:
- Answer the actual question asked. If a recruiter asks whether Talha suits a role, do NOT recite his biography — instead: identify the role and requirements, match each requirement against documented evidence with its strength (direct project evidence / direct experience / toolkit-only / not documented), identify gaps, then give a clear recommendation.
- Fit levels you may use: strong match worth interviewing / promising match with gaps to validate / not enough evidence for the stated requirements. Choose honestly. Hiring recommendations mean "worth interviewing", never "guaranteed performance".
- If a senior role or a years-of-experience requirement is stated and the evidence doesn't establish it, say so and recommend validating it in an interview.
- Technology questions: state where and how the technology was used, and whether that is direct project evidence or just a toolkit listing.
- Interview-question requests: generate questions derived ONLY from documented work.
- Off-topic requests (code, general knowledge, chit-chat): one-sentence polite redirect to Talha's work, then offer a portfolio topic.

Style:
- Recruiter/fit analyses: 150–300 words. Simple questions: 2–5 sentences. Job-description analyses: use a short requirement-by-requirement breakdown.
- Clean prose, no markdown headers, no emoji.
- End by listing exactly 3 short suggested follow-up questions, contextual to your answer (not generic boilerplate).`;

/* ── provider calls ──────────────────────────────────────────── */
async function callGLM(
  p: { model: string; key: string },
  system: string,
  user: string,
  signal: AbortSignal
): Promise<string> {
  const models = [p.model, "glm-4.5-flash"].filter((m, i, a) => a.indexOf(m) === i);
  let lastErr: unknown = new Error("untried");
  for (const model of models) {
    try {
      const res = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          max_tokens: 900,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal,
      });
      if (!res.ok) {
        lastErr = new Error(`GLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
        continue;
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return text;
      lastErr = new Error("GLM returned empty content");
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function callGemini(
  p: { model: string; key: string },
  system: string,
  user: string,
  signal: AbortSignal
): Promise<string> {
  const models = [p.model, "gemini-1.5-flash"].filter((m, i, a) => a.indexOf(m) === i);
  let lastErr: unknown = new Error("untried");
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${p.key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ parts: [{ text: user }] }],
            generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
          }),
          signal,
        }
      );
      if (!res.ok) {
        lastErr = new Error(`Gemini ${res.status}`);
        continue;
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.trim()) return text;
      lastErr = new Error("Gemini returned empty content");
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/* ── parse & validate ────────────────────────────────────────── */
const ACTION_TYPES = new Set([
  "scroll_to_project", "scroll_to_experience", "scroll_to_expertise", "scroll_to_contact",
  "scroll_to_notes", "scroll_to_systems", "open_resume", "open_github", "open_linkedin", "open_email",
]);
const PROJECT_TARGETS: Record<string, string> = {
  malaria: "malaria-case-study",
  automation: "outbound-automation",
  deepfake: "deepfake-detection",
  news: "news-nlp",
  commerce: "b2b-commerce",
  voice: "voice-pipeline",
};
const ACTION_LABELS: Record<string, string> = {
  "scroll_to_project:malaria": "View the malaria case study →",
  "scroll_to_project:automation": "See the automation pipeline →",
  "scroll_to_project:deepfake": "View deepfake detection →",
  "scroll_to_project:news": "View the news analyzer →",
  "scroll_to_project:commerce": "View the commerce platform →",
  "scroll_to_project:voice": "View the voice pipeline →",
  scroll_to_experience: "View experience →",
  scroll_to_expertise: "Open the tech map →",
  scroll_to_contact: "Open the contact form →",
  scroll_to_notes: "Read the engineering notes →",
  scroll_to_systems: "Explore the system architectures →",
  open_resume: "View resume ↓",
  open_github: "GitHub →",
  open_linkedin: "LinkedIn →",
  open_email: "Email Talha →",
};

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("No JSON object in model output");
  }
}

function validate(parsed: unknown): { message: string; actions: AssistantResult["actions"]; followUps: string[] } {
  const o = parsed as Record<string, unknown>;
  const message = typeof o.message === "string" ? o.message.trim().slice(0, 2800) : "";
  if (message.length < 8) throw new Error("Model message missing or too short");

  const rawActions = Array.isArray(o.actions) ? o.actions.slice(0, 3) : [];
  const actions: AssistantResult["actions"] = [];
  for (const a of rawActions) {
    const rec = a as { type?: unknown; target?: unknown };
    if (typeof rec.type !== "string" || !ACTION_TYPES.has(rec.type)) continue;
    let target = typeof rec.target === "string" ? rec.target : undefined;
    if (rec.type === "scroll_to_project") {
      if (!target || !PROJECT_TARGETS[target]) continue;
      target = PROJECT_TARGETS[target];
    }
    const label = ACTION_LABELS[rec.type === "scroll_to_project" ? `scroll_to_project:${target}` : rec.type];
    if (!label) continue;
    actions.push({ type: rec.type, target, label });
  }

  const followUps = Array.isArray(o.follow_ups)
    ? o.follow_ups.filter((f): f is string => typeof f === "string" && f.trim().length > 4).slice(0, 3)
    : [];

  return { message, actions, followUps };
}

/* ── main entry ──────────────────────────────────────────────── */
export async function askAssistant(question: string, history: Turn[]): Promise<AssistantResult> {
  const provider = pickProvider(); // throws MissingKeyError if unconfigured
  const intent = classifyIntent(question);
  const evidence = buildEvidence(question, history, intent);

  const system = `${SYSTEM_RULES}\n\n${JSON_CONTRACT}\n\nEVIDENCE (the only source of facts about Talha):\n${evidence}\n\n${identityBlock()}`;
  const user = `VISITOR QUESTION: ${question}`;

  console.log(
    `[Portfolio AI] provider=${provider.name} model=${provider.model} intent=${intent} questionLen=${question.length}`
  );

  const signal = new AbortController().signal;
  let text = "";
  let usedModel = provider.model;

  if (provider.name === "glm") {
    text = await callGLM({ model: provider.model, key: provider.key }, system, user, signal);
  } else {
    text = await callGemini({ model: provider.model, key: provider.key }, system, user, signal);
  }

  console.log(`[Portfolio AI] LLM response received (${text.length} chars)`);

  const parsed = validate(extractJson(text));
  console.log("[Portfolio AI] response validated");

  return {
    message: parsed.message,
    actions: parsed.actions,
    followUps: parsed.followUps,
    meta: { provider: provider.name, model: usedModel, intent },
  };
}
