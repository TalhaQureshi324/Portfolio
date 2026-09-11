import { FEATURED, PROJECTS, EXPERIENCE, NOTES } from "./data";
import { TECH_INDEX } from "./tech-evidence";

/**
 * CANONICAL PORTFOLIO KNOWLEDGE — the source of truth the assistant
 * reasons over. Assembled from the same data the UI renders, so the
 * chatbot and the page can never tell different stories.
 */

export const IDENTITY = {
  name: "Muhammad Talha Qureshi",
  preferred: "Talha",
  title: "AI/ML Engineer & Full-Stack Developer",
  location: "Pakistan",
  timezone: "UTC+5",
  education: "Final-year BS Computer Science, AI concentration",
  currently: "AI Automation & Full-Stack Developer at Intellimind (remote, Feb 2026–present)",
  mentoring: "Technical Speaker & AI Mentor at Dev Weekends — 50+ developers",
  availability: "Open to full-time roles and selective freelance; usually replies within a day",
  email: "iamtalhaqureshi849@gmail.com",
  github: "github.com/TalhaQureshi324",
  linkedin: "linkedin.com/in/muhammad-talha-27b709331/",
};

export interface KnowledgeSection {
  id: string;
  title: string;
  keywords: string[];
  detail: string;
}

function projectSection(p: {
  id: string;
  title: string;
  role?: string;
  tagline: string;
  stack: string[];
  description?: string;
  metrics?: { value: string; label: string; context: string }[];
}): KnowledgeSection {
  const metrics = p.metrics?.map((m) => `${m.value} ${m.label} — ${m.context}`).join("; ") ?? "";
  const detail = [
    p.description ?? p.tagline,
    p.metrics && p.metrics.length ? `Measured results (with context): ${metrics}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return {
    id: p.id,
    title: p.title,
    keywords: [p.title, p.id, ...p.stack, ...(p.role ?? "").split(/[,&·/]+/)],
    detail: `Role: ${p.role ?? "—"}. Stack: ${p.stack.join(", ")}.\n${detail}`,
  };
}

/** All documented sections, scored for retrieval */
export const SECTIONS: KnowledgeSection[] = [
  {
    id: "featured-malaria",
    title: FEATURED.title,
    keywords: ["malaria", "monolayer", "parasite", "parasitemia", "microscope", "microscopy", "biomedical", "blood", "slide", "giemsa", "plasmodium", "hardware", "serial", "fyp", "final year", "cv", "computer vision", "opencv", "segmentation"],
    detail: `Role: ${FEATURED.role}. Domain: ${FEATURED.domain}. Timeline: ${FEATURED.timeline}.\nProblem: ${FEATURED.problem}\nApproach: ${FEATURED.approach}\nMeasured results (with context): ${FEATURED.results
      .map((r) => `${r.value} ${r.label} — ${r.context}`)
      .join("; ")}.\nStack: ${FEATURED.stack.join(", ")}.`,
  },
  ...PROJECTS.map(
    (p): KnowledgeSection => ({
      id: p.id,
      title: p.title,
      keywords: [p.title, p.id, ...p.stack, ...p.role.split(/[,&·/]+/)],
      detail: `Role: ${p.role} · ${p.year}.\n${p.description}\nMeasured results (with context): ${p.metrics
        ?.map((m) => `${m.value} ${m.label} — ${m.context}`)
        .join("; ")}.`,
    })
  ),
  ...EXPERIENCE.map(
    (e): KnowledgeSection => ({
      id: e.role.toLowerCase().replace(/[^a-z]+/g, "-").slice(0, 30),
      title: `${e.role} — ${e.org}`,
      keywords: [e.org, e.role, e.period, ...(e.location ?? "").split(/[, ]+/)],
      detail: `${e.period}. ${e.location ?? ""}\n${e.points.map((pt) => `- ${pt}`).join("\n")}`,
    })
  ),
  {
    id: "eng-note-monolayer",
    title: "Engineering note — why monolayer detection comes first",
    keywords: ["monolayer", "why", "first", "order", "pipeline", "come first", "comes first"],
    detail: NOTES[0].answer,
  },
  {
    id: "eng-note-outreach",
    title: "Engineering note — how the outreach stays non-generic",
    keywords: ["outreach", "generic", "personalization", "personalised", "llm", "prompt", "templates"],
    detail: NOTES[1].answer,
  },
  {
    id: "eng-note-temporal",
    title: "Engineering note — why the deepfake model reads frames in sequence",
    keywords: ["sequence", "sequential", "frames", "temporal", "lstm", "why"],
    detail: NOTES[2].answer,
  },
  {
    id: "eng-note-latency",
    title: "Engineering note — what a latency budget does to a pipeline",
    keywords: ["latency", "budget", "60ms", "real-time", "realtime", "inference"],
    detail: NOTES[3].answer,
  },
  {
    id: "tech-evidence-index",
    title: "Technology → evidence relationships",
    keywords: ["pytorch", "playwright", "redis", "fastapi", "next.js", "n8n", "opencv", "lime", "bert", "librosa", "websockets", "shopify", "streamlit", "technology", "technologies", "used"],
    detail: TECH_INDEX.map(
      (t) =>
        `${t.name} [${t.strength}]: ${t.evidence
          .map((e) => `${e.title} (${e.how})`)
          .join(" | ") || "listed in toolkit; no documented project on this page"}`
    ).join("\n"),
  },
  {
    id: "toolkit-boundary",
    title: "Toolkit vs documented evidence",
    keywords: ["docker", "kubernetes", "aws", "tensorflow", "postgres", "postgresql", "gcp", "azure", "graphql", "flutter", "toolkit"],
    detail:
      "Listed in his toolkit but NOT tied to a documented project on this page: TensorFlow, Django, Flask, .NET, PostgreSQL, Docker, Kubernetes, AWS, GCP, Azure, Linux, CI/CD, Flutter, MongoDB, REST & gRPC, Puppeteer, GraphQL. For these, professional depth cannot be confirmed from the portfolio.",
  },
];

export function identityBlock(): string {
  return `Name: ${IDENTITY.name} (prefers "Talha")
Title: ${IDENTITY.title}
Education: ${IDENTITY.education}
Based: ${IDENTITY.location} — ${IDENTITY.timezone}
Currently: ${IDENTITY.currently}
Mentoring: ${IDENTITY.mentoring}
Availability: ${IDENTITY.availability}
Contact: ${IDENTITY.email} · ${IDENTITY.linkedin} · ${IDENTITY.github}`;
}

/** Sections relevant to a question, scored by keyword overlap */
export function retrieveSections(question: string, history: string[], broad: boolean): KnowledgeSection[] {
  const tokens = `${question} ${history.slice(-3).join(" ")}`.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const scored = SECTIONS.map((s) => {
    const hay = `${s.title} ${s.keywords.join(" ")} ${s.detail}`.toLowerCase();
    let score = tokens.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
    if (s.id === "identity") score += 1; // always mildly relevant
    return { s, score };
  }).sort((a, b) => b.score - a.score);

  if (broad) return scored.map((x) => x.s);
  return scored.slice(0, 4).map((x) => x.s);
}

/** Compact all-projects profile for broad/assessment questions */
export function compactProfile(): string {
  const all = [
    {
      title: FEATURED.title,
      role: FEATURED.role,
      stack: FEATURED.stack.join(", "),
      line: FEATURED.summary,
      metrics: FEATURED.results.map((r) => `${r.value} ${r.label} (${r.context})`).join("; "),
    },
    ...PROJECTS.map((p) => ({
      title: p.title,
      role: p.role,
      stack: p.stack.join(", "),
      line: p.description,
      metrics: p.metrics?.map((m) => `${m.value} ${m.label} (${m.context})`).join("; ") ?? "",
    })),
  ];
  return all
    .map(
      (p) =>
        `${p.title}\n  role: ${p.role}\n  stack: ${p.stack}\n  ${p.line}\n  results: ${p.metrics || "—"}`
    )
    .join("\n\n");
}
