import { FEATURED } from "./data";
import { IDENTITY } from "./portfolio-knowledge";
import { findTechMentions, TECH_INDEX } from "./tech-evidence";

/**
 * LOCAL PORTFOLIO REASONING — the guaranteed-answer layer.
 * When both LLM providers fail (or are unconfigured), this composes
 * useful, evidence-grounded answers deterministically: recruiter fit
 * analysis, interview questions, and technology-evidence checks.
 * Nothing here invents facts; absence of evidence is stated as such.
 */

export interface LocalAnswer {
  text: string;
  actions: { label: string; type: string; target?: string }[];
  followUps: string[];
}

const ACTIONS = {
  malaria: { label: "View the malaria case study →", type: "scroll_to_project", target: "malaria-case-study" },
  outbound: { label: "See the automation pipeline →", type: "scroll_to_project", target: "outbound-automation" },
  deepfake: { label: "View deepfake detection →", type: "scroll_to_project", target: "deepfake-detection" },
  news: { label: "View the news analyzer →", type: "scroll_to_project", target: "news-nlp" },
  commerce: { label: "View the commerce platform →", type: "scroll_to_project", target: "b2b-commerce" },
  voice: { label: "View the voice pipeline →", type: "scroll_to_project", target: "voice-pipeline" },
  experience: { label: "View experience →", type: "scroll_to", target: "experience" },
  expertise: { label: "Open the tech map →", type: "scroll_to", target: "expertise" },
  contact: { label: "Open the contact form →", type: "scroll_to", target: "contact" },
  work: { label: "View selected work →", type: "scroll_to", target: "work" },
};

/* Technologies that appear in the toolkit but have no documented
   project use on this page — surfaced from the toolkit boundary. */
const TOOLKIT_ONLY = new Set([
  "tensorflow", "django", "flask", ".net", "postgresql", "postgres", "docker",
  "kubernetes", "aws", "gcp", "azure", "linux", "ci/cd", "cicd", "flutter",
  "mongodb", "rest", "grpc", "puppeteer", "graphql",
]);

const ROLE_EVIDENCE: Record<string, string> = {
  "ai engineer":
    "For the broader AI engineering requirement: AI automation and backend services at Intellimind (FastAPI pipelines, NLP-driven assistants, automated business workflows), computer vision and deep learning across the malaria and deepfake projects, and applied LLM work in the outbound automation.",
  "ai automation":
    "For AI automation specifically: he builds AI automation solutions, backend services and NLP-driven assistants at Intellimind, and independently built a self-hosted n8n pipeline (Python, Playwright, LLM APIs, webhooks) that runs from target list to sent email with no manual steps.",
  "full-stack":
    "For full-stack evidence: headless Next.js + Shopify Liquid commerce work (1.2s LCP p75 on field data after rebuild), FastAPI and Streamlit interfaces in the malaria system, and Next.js/React on this portfolio.",
  "frontend": "For frontend evidence: headless Next.js portal on the B2B commerce platform, Shopify Liquid storefront work, and this React/Next.js portfolio.",
  backend: "For backend evidence: FastAPI pipelines at Intellimind and in the malaria system, Redis caching in two shipped projects, WebSockets in the voice pipeline, and webhook-driven n8n automation.",
};

function detectRole(q: string): string | null {
  if (/automation/.test(q)) return "ai automation";
  if (/full-?stack/.test(q)) return "full-stack";
  if (/front-?end|react|next\.?js/.test(q)) return "frontend";
  if (/back-?end|api|server/.test(q)) return "backend";
  if (/\bai\b|ml\b|machine learning|engineer|developer/.test(q)) return "ai engineer";
  return null;
}

/* Pull explicit requirement candidates out of a hiring question. */
function detectRequirements(q: string): string[] {
  const reqs = new Set<string>();
  for (const t of findTechMentions(q)) reqs.add(t.name.toLowerCase());
  for (const t of TECH_INDEX) if (new RegExp(`\\b${t.name.replace(/[.+*]/g, "\\$&")}\\b`, "i").test(q)) reqs.add(t.name.toLowerCase());
  for (const t of TOOLKIT_ONLY) if (new RegExp(`\\b${t.replace(/[.+*/]/g, "\\$&")}\\b`, "i").test(q)) reqs.add(t);
  // "8 years of AWS" style experience-year requirements
  const years = q.match(/(\d+)\s*\+?\s*years?/i);
  if (years) reqs.add(`${years[1]}+ years experience`);
  return [...reqs];
}

function strengthLabel(name: string): { verdict: string; detail: string } {
  const entry = TECH_INDEX.find((t) => t.name.toLowerCase() === name);
  if (entry) {
    const ev = entry.evidence.map((e) => `${e.title} — ${e.how}`).join("; ");
    return {
      verdict: "Direct project evidence",
      detail: ev || "documented on this page",
    };
  }
  if (TOOLKIT_ONLY.has(name))
    return {
      verdict: "Toolkit listing only",
      detail: "listed in his toolkit, but no documented project use on this page — depth cannot be confirmed from the portfolio",
    };
  return {
    verdict: "Not established",
    detail: "the portfolio does not document this",
  };
}

/* ── recruiter fit: UNDERSTAND → RETRIEVE → ASSESS, locally ──── */
function fitAnalysis(q: string): LocalAnswer | null {
  const requirements = detectRequirements(q);
  const role = detectRole(q);
  if (requirements.length === 0 && !role) return null;

  const sections: string[] = [];
  let direct = 0;
  let insufficient = 0;

  if (requirements.length > 0) {
    for (const r of requirements) {
      if (/years?/.test(r)) {
        insufficient++;
        sections.push(`${r}: the portfolio does not establish years-of-experience claims — it documents projects and roles, not tenures in numbers.`);
        continue;
      }
      const s = strengthLabel(r);
      if (s.verdict === "Direct project evidence") direct++;
      else if (s.verdict !== "Toolkit listing only") insufficient++;
      sections.push(`${r}: ${s.verdict}. ${s.detail}.`);
    }
  }

  if (role && ROLE_EVIDENCE[role]) sections.push(ROLE_EVIDENCE[role]);

  let recommendation: string;
  if (direct > 0 && insufficient === 0)
    recommendation = `Assessment: strong match on the documented evidence — worth interviewing. The one thing to validate in the interview is the depth and production scale of the ${requirements.filter((r) => !/years?/.test(r)).join(" / ")} experience.`;
  else if (direct > 0 && insufficient > 0)
    recommendation = `Assessment: good match with gaps. The portfolio directly evidences ${requirements.filter((r) => strengthLabel(r).verdict === "Direct project evidence").join(", ")}, but ${requirements.filter((r) => strengthLabel(r).verdict !== "Direct project evidence" && !/years?/.test(r)).join(", ") || "some stated requirements"} cannot be confirmed from it. Worth an interview to probe the gaps.`;
  else if (insufficient > 0 && requirements.length > 0)
    recommendation = `Assessment: the current portfolio does not establish these specific requirements. That is not a no — it means this page documents no direct evidence for them — but I can't call it a match from what's documented here.`;
  else
    recommendation = `Assessment: the portfolio shows relevant applied AI engineering evidence — worth an interview to go deeper.`;

  const text =
    `Here's a requirement-by-requirement check against the documented portfolio:\n\n` +
    sections.map((s) => `• ${s}`).join("\n") +
    `\n\n${recommendation}`;

  return {
    text,
    actions: [ACTIONS.malaria, ACTIONS.outbound, ACTIONS.contact],
    followUps: [
      "What are his strongest AI projects?",
      "What unique thing does Talha bring?",
      "How can I contact him?",
    ],
  };
}

/* ── interview questions grounded in real evidence ───────────── */
function interviewQuestions(): LocalAnswer {
  const text = [
    `Targeted questions based on what this portfolio actually documents:`,
    ``,
    `• Malaria screening: "Walk me through the pipeline architecture — why does monolayer detection run before cell classification?" (His engineering notes answer this directly: downstream stages assume separated cells, and it's the step that saves the most human time.)`,
    `• Real-time constraints: "The system holds per-frame inference under 60ms on-device. What did that budget force you to change?"`,
    `• Playwright: "In the outbound automation, what exactly does Playwright do in the site audits, and how did you handle fragile selectors or anti-bot behavior?"`,
    `• Redis: "You used Redis in both the news aggregator and the B2B commerce platform — compare the two caching strategies and what 1.2s LCP p75 took."`,
    `• Deepfake detection: "Why a hybrid Xception-LSTM rather than a pure CNN, and how does LIME change how you present verdicts?"`,
    `• Voice pipeline: "How does overlap-add windowing keep spectral artifacts out of continuous output at <120ms round-trip?"`,
    `• Automation: "In the n8n outreach pipeline, how do you keep LLM-drafted emails honest when the audit finds nothing worth mentioning?"`,
  ].join("\n");
  return {
    text,
    actions: [ACTIONS.work, ACTIONS.experience],
    followUps: ["What are his strongest AI projects?", "What is his experience?", "What unique thing does Talha bring?"],
  };
}

/* ── technology-evidence question ("does he actually know X") ── */
function techEvidence(q: string): LocalAnswer | null {
  const mentions = findTechMentions(q);
  const unknown = [...TOOLKIT_ONLY].filter((t) => new RegExp(`\\b${t.replace(/[.+*/]/g, "\\$&")}\\b`, "i").test(q));
  if (mentions.length === 0 && unknown.length === 0) return null;

  const lines: string[] = [];
  for (const m of mentions) {
    const ev = m.evidence.map((e) => `${e.title} — ${e.how}`).join("; ");
    lines.push(
      m.strength === "DIRECT_PROJECT"
        ? `${m.name}: direct project evidence. ${ev}.`
        : `${m.name}: toolkit listing only — no documented project use on this page.`
    );
  }
  for (const u of unknown)
    if (!mentions.some((m) => m.name.toLowerCase() === u))
      lines.push(`${u}: not established by the portfolio — it's either absent or a toolkit listing without a documented project.`);

  return {
    text: lines.join("\n"),
    actions: [ACTIONS.expertise],
    followUps: ["What are his strongest AI projects?", "What is his experience?", "What does he specialize in?"],
  };
}

/* ── last-resort grounded answer (never "unavailable") ───────── */
export function genericGroundedAnswer(): LocalAnswer {
  const metrics = [
    ...FEATURED.results.map((r) => `${r.value} ${r.label} (${r.context})`),
  ].join(", ");
  return {
    text: `I can ground every answer in what this portfolio documents. Quick orientation: Talha is an ${IDENTITY.title} based in ${IDENTITY.location}, currently ${IDENTITY.currently}. His flagship result: ${FEATURED.title} — ${metrics}. Ask me about a project, a technology, his experience, or a hiring fit check.`,
    actions: [ACTIONS.work, ACTIONS.experience, ACTIONS.contact],
    followUps: ["What does Talha specialize in?", "What are his strongest AI projects?", "Tell me about the malaria project."],
  };
}

/** Local reasoning router — used when the LLM path can't answer. */
export function localAnswer(question: string): LocalAnswer | null {
  const q = question.toLowerCase();
  const hiring = /\b(hire|hiring|recruiter|candidate|shortlist|fit|suitable|qualified|we need|looking for|role|position|requirement)\b/.test(q);
  const interview = /(interview|what (should|could|would) (i|we) ask|questions for)/.test(q);

  if (interview) return interviewQuestions();
  if (hiring) {
    const fit = fitAnalysis(q);
    if (fit) return fit;
  }
  const tech = techEvidence(q);
  if (tech) return tech;
  return null;
}
