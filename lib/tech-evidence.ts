/**
 * TECHNOLOGY EVIDENCE INDEX — relationship-aware knowledge.
 *
 * Every technology maps to where it was actually used, how, and how
 * strong the documented evidence is. The assistant uses this to
 * reason about fit instead of keyword-matching skill lists.
 *
 * Strength levels:
 *   DIRECT_PROJECT     — named inside a documented project's stack/work
 *   DIRECT_EXPERIENCE  — named inside a documented work experience
 *   TOOLKIT_ONLY       — listed as capability, no project evidence here
 *   NOT_DOCUMENTED     — not established anywhere in the portfolio
 */

export type EvidenceStrength =
  | "DIRECT_PROJECT"
  | "DIRECT_EXPERIENCE"
  | "RELATED_PROJECT"
  | "TOOLKIT_ONLY"
  | "NOT_DOCUMENTED";

export interface EvidenceItem {
  context: "project" | "experience";
  title: string;
  how: string;
  /** scroll target for "view evidence" actions */
  target?: string;
}

export interface TechEvidence {
  name: string;
  aliases: string[];
  strength: EvidenceStrength;
  evidence: EvidenceItem[];
}

export const TECH_INDEX: TechEvidence[] = [
  {
    name: "Playwright",
    aliases: ["playwright"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Autonomous Outbound & Site-Audit Automation",
        how: "Drives the headless site-audit bots and lead scrapers — part of a broader Python/n8n automation pipeline used to audit target websites and support automated outbound workflows.",
        target: "outbound-automation",
      },
    ],
  },
  {
    name: "Redis",
    aliases: ["redis"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "B2B Commerce Platform",
        how: "Catalog caching for the headless portal — keeping volume pricing and a large SKU catalog fast for wholesale sessions.",
        target: "b2b-commerce",
      },
      {
        context: "project",
        title: "Cross-Source News Aggregation & Bias Analysis",
        how: "Feed caching between pipeline runs so 34 live sources stay responsive.",
        target: "news-nlp",
      },
    ],
  },
  {
    name: "PyTorch",
    aliases: ["pytorch", "torch"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Malaria Screening (FYP)",
        how: "Training and inference for erythrocyte segmentation and Plasmodium classification.",
        target: "malaria-case-study",
      },
      {
        context: "project",
        title: "Deepfake Detection Engine",
        how: "Xception + LSTM training and inference.",
        target: "deepfake-detection",
      },
    ],
  },
  {
    name: "FastAPI",
    aliases: ["fastapi"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Malaria Screening (FYP)",
        how: "Screening report API and dashboard backend.",
        target: "malaria-case-study",
      },
      {
        context: "experience",
        title: "Intellimind — AI Automation & Full-Stack Developer",
        how: "Backend services and FastAPI pipelines in production AI automation work.",
        target: "experience",
      },
    ],
  },
  {
    name: "n8n",
    aliases: ["n8n"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Autonomous Outbound & Site-Audit Automation",
        how: "Self-hosted workflow engine orchestrating every pipeline stage: scraping, qualification, auditing, personalization, dispatch.",
        target: "outbound-automation",
      },
    ],
  },
  {
    name: "OpenCV",
    aliases: ["opencv", "cv2"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Malaria Screening (FYP)",
        how: "Live feed processing, frame stabilization and the monolayer detection engine.",
        target: "malaria-case-study",
      },
      {
        context: "project",
        title: "Deepfake Detection Engine",
        how: "Frame extraction and face alignment.",
        target: "deepfake-detection",
      },
    ],
  },
  {
    name: "LLM APIs",
    aliases: ["llm api", "llm apis", "llms", "openai", "anthropic", "prompt"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Autonomous Outbound & Site-Audit Automation",
        how: "Drafts audit-grounded outreach from structured findings JSON — no generic templates.",
        target: "outbound-automation",
      },
      {
        context: "experience",
        title: "Intellimind",
        how: "NLP-driven assistants and LLM-powered business workflow automation.",
        target: "experience",
      },
    ],
  },
  {
    name: "Next.js",
    aliases: ["next.js", "nextjs", "next"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "B2B Commerce Platform",
        how: "Headless portal and storefront for wholesale workflows.",
        target: "b2b-commerce",
      },
      {
        context: "project",
        title: "News & Bias Analyzer",
        how: "Coverage comparison interface.",
        target: "news-nlp",
      },
    ],
  },
  {
    name: "Python",
    aliases: ["python"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Malaria Screening (FYP)",
        how: "The full CV/ML pipeline — preprocessing, model, serving layer.",
        target: "malaria-case-study",
      },
      {
        context: "project",
        title: "Outbound Automation",
        how: "Scrapers, audit bots and pipeline glue.",
        target: "outbound-automation",
      },
      {
        context: "project",
        title: "Voice Conversion Pipeline",
        how: "Real-time streaming audio processing.",
        target: "voice-pipeline",
      },
    ],
  },
  {
    name: "LIME",
    aliases: ["lime"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Deepfake Detection Engine",
        how: "Verdict attribution — facial-region heatmaps that make decisions auditable.",
        target: "deepfake-detection",
      },
    ],
  },
  {
    name: "WebSockets",
    aliases: ["websocket", "websockets"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Voice Conversion Pipeline",
        how: "Streaming audio transport for live conversion.",
        target: "voice-pipeline",
      },
    ],
  },
  {
    name: "BERT",
    aliases: ["bert"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "News & Bias Analyzer",
        how: "Article embeddings for narrative clustering.",
        target: "news-nlp",
      },
    ],
  },
  {
    name: "Shopify Liquid",
    aliases: ["shopify", "liquid"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "B2B Commerce Platform",
        how: "Custom storefront theming and B2B volume-pricing logic.",
        target: "b2b-commerce",
      },
    ],
  },
  {
    name: "Librosa",
    aliases: ["librosa"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Voice Conversion Pipeline",
        how: "Spectral feature extraction for the conversion model.",
        target: "voice-pipeline",
      },
    ],
  },
  {
    name: "scikit-learn",
    aliases: ["scikit-learn", "scikit", "sklearn"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "News & Bias Analyzer",
        how: "Embedding clustering and bias scoring.",
        target: "news-nlp",
      },
    ],
  },
  {
    name: "Custom CNNs",
    aliases: ["cnn", "cnns", "convolutional"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Malaria Screening (FYP)",
        how: "Erythrocyte segmentation and parasite classification.",
        target: "malaria-case-study",
      },
    ],
  },
  {
    name: "CNN-LSTM hybrids",
    aliases: ["cnn-lstm", "cnn lstm", "lstm"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Deepfake Detection Engine",
        how: "Spatial + temporal fusion — the core hybrid architecture.",
        target: "deepfake-detection",
      },
    ],
  },
  {
    name: "Streamlit",
    aliases: ["streamlit"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "Malaria Screening (FYP)",
        how: "Operator-facing screening dashboard.",
        target: "malaria-case-study",
      },
    ],
  },
  /* ── toolkit / not established ── */
  {
    name: "Docker",
    aliases: ["docker", "containers"],
    strength: "TOOLKIT_ONLY",
    evidence: [],
  },
  {
    name: "Kubernetes",
    aliases: ["kubernetes", "k8s"],
    strength: "TOOLKIT_ONLY",
    evidence: [],
  },
  {
    name: "TensorFlow",
    aliases: ["tensorflow", "keras"],
    strength: "TOOLKIT_ONLY",
    evidence: [],
  },
  {
    name: "PostgreSQL",
    aliases: ["postgres", "postgresql"],
    strength: "TOOLKIT_ONLY",
    evidence: [],
  },
  {
    name: "AWS",
    aliases: ["aws", "amazon web services"],
    strength: "NOT_DOCUMENTED",
    evidence: [],
  },
  {
    name: "GCP",
    aliases: ["gcp", "google cloud"],
    strength: "NOT_DOCUMENTED",
    evidence: [],
  },
  {
    name: "Django",
    aliases: ["django"],
    strength: "TOOLKIT_ONLY",
    evidence: [],
  },
  {
    name: "Flutter",
    aliases: ["flutter"],
    strength: "TOOLKIT_ONLY",
    evidence: [],
  },
  {
    name: "GraphQL",
    aliases: ["graphql"],
    strength: "DIRECT_PROJECT",
    evidence: [
      {
        context: "project",
        title: "B2B Commerce Platform",
        how: "Data layer between the headless Next.js portal and Shopify.",
        target: "b2b-commerce",
      },
    ],
  },
];

/**
 * Find technologies explicitly mentioned in a piece of text
 * (recruiter requirement, job description…).
 */
export function findTechMentions(text: string): TechEvidence[] {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9.+-\s]/g, " ").replace(/\s+/g, " ")} `;
  const out: TechEvidence[] = [];
  for (const tech of TECH_INDEX) {
    if (tech.aliases.some((a) => t.includes(` ${a} `) || t.includes(`${a}.`) || t.includes(` ${a},`) || t.includes(` ${a}.`))) {
      out.push(tech);
    }
  }
  return out;
}
