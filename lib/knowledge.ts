import { TECH_MAP, SOCIALS, NOTES } from "./data";

/**
 * PORTFOLIO KNOWLEDGE — single source of truth for the "Ask Talha"
 * assistant. Everything here is derived from the content actually
 * presented on the site (lib/data.ts). If it isn't in here, the
 * assistant says it can't confirm it — never invents.
 *
 * Metric contexts are mandatory: every number carries its qualifier.
 */

export type ActionType = "scroll_to" | "resume" | "email" | "github" | "linkedin" | "contact_form";

export interface ChatAction {
  label: string;
  type: ActionType;
  /** validated scroll target id (allowlist enforced in engine) */
  target?: string;
}

export interface KnowledgeEntry {
  id: string;
  /** topic key used for conversation follow-up resolution */
  topic?: string;
  keywords: string[];
  message: string;
  actions: ChatAction[];
  followUps: string[];
}

const A = {
  malaria: { label: "Explore the malaria case study →", type: "scroll_to" as const, target: "malaria-case-study" },
  automation: { label: "See the automation pipeline →", type: "scroll_to" as const, target: "outbound-automation" },
  deepfake: { label: "View deepfake detection →", type: "scroll_to" as const, target: "deepfake-detection" },
  news: { label: "View the news analyzer →", type: "scroll_to" as const, target: "news-nlp" },
  commerce: { label: "View the commerce platform →", type: "scroll_to" as const, target: "b2b-commerce" },
  voice: { label: "View the voice pipeline →", type: "scroll_to" as const, target: "voice-pipeline" },
  cv: { label: "View computer vision work →", type: "scroll_to" as const, target: "malaria-case-study" },
  contact: { label: "Open the contact form →", type: "scroll_to" as const, target: "contact" },
  expertise: { label: "Open the tech map →", type: "scroll_to" as const, target: "expertise" },
  notes: { label: "Read the engineering notes →", type: "scroll_to" as const, target: "notes" },
  systems: { label: "Explore the system architectures →", type: "scroll_to" as const, target: "systems" },
  experience: { label: "View experience →", type: "scroll_to" as const, target: "experience" },
  about: { label: "More about Talha →", type: "scroll_to" as const, target: "about" },
  resume: { label: "View resume ↓", type: "resume" as const },
  email: { label: "Email Talha", type: "email" as const },
  github: { label: "GitHub", type: "github" as const },
  linkedin: { label: "LinkedIn", type: "linkedin" as const },
};

/* ── identity & career ───────────────────────────────────────── */
export const IDENTITY = {
  name: "Muhammad Talha Qureshi",
  preferred: "Talha",
  title: "AI/ML Engineer & Full-Stack Developer",
  location: "Pakistan",
  timezone: "UTC+5",
  education: "Final-year BS Computer Science, AI concentration",
  currently: "AI Automation & Full-Stack Developer at Intellimind",
  availability: "Available for new opportunities — full-time roles and selective freelance",
  email: SOCIALS.email.replace("mailto:", ""),
};

export const CONTACT_ACTIONS: ChatAction[] = [
  { label: "Open the contact form →", type: "contact_form", target: "contact" },
  A.email,
  A.linkedin,
];

/* ── knowledge entries ───────────────────────────────────────── */
export const ENTRIES: KnowledgeEntry[] = [
  {
    id: "identity",
    topic: "identity",
    keywords: ["who", "talha", "qureshi", "about", "bio", "background", "introduce", "yourself", "himself", "person", "engineer", "developer", "student"],
    message:
      "Muhammad Talha Qureshi is an AI/ML engineer and full-stack developer based in Pakistan (UTC+5), in his final year of a BS in Computer Science with an AI concentration. He builds AI-powered products end to end — the signature example is a microscope-integrated malaria screening system — alongside automation pipelines, NLP work and the web applications that deliver them. He currently works as an AI Automation & Full-Stack Developer at Intellimind and mentors developers at Dev Weekends.",
    actions: [A.about, A.malaria, A.contact],
    followUps: ["What does Talha specialize in?", "Tell me about the malaria project.", "Where does he work?"],
  },
  {
    id: "specialization",
    topic: "specialization",
    keywords: ["specialize", "specialise", "specialization", "focus", "strengths", "good at", "expertise", "skills", "skilled", "stack", "technologies", "tech"],
    message:
      "Talha's work spans four areas that reinforce each other: computer vision (OpenCV, custom CNNs, CNN-LSTM hybrids — applied to biomedical imaging and video), NLP (transformers, BERT, summarization and clustering), automation (n8n orchestration, headless-browser auditing, LLM-generated outreach), and full-stack delivery (Next.js, FastAPI, PostgreSQL/Redis — building the APIs and interfaces around the models). The tech map on this page links every technology to the specific projects that used it.",
    actions: [A.expertise, A.cv],
    followUps: ["Where has he used PyTorch?", "What are his AI projects?", "Does he have full-stack experience?"],
  },
  {
    id: "cv-evidence",
    topic: "cv-evidence",
    keywords: ["computer vision", "vision", "cv", "image", "imaging", "biomedical", "segmentation", "video"],
    message:
      "The strongest computer vision evidence is: 01 — Malaria Screening: a microscope-integrated system doing monolayer detection, erythrocyte segmentation and Plasmodium classification in real time (96.8% detection sensitivity on a held-out test set, <60ms per-frame inference on device). 03 — Deepfake Detection: a hybrid Xception-LSTM engine scoring spatial artifacts and temporal inconsistency, with LIME heatmaps for interpretability (98.4% accuracy on a held-out FaceForensics++ benchmark).",
    actions: [A.malaria, A.deepfake],
    followUps: ["Tell me about the malaria project.", "Why is the deepfake model hybrid?", "Which project shows explainable AI?"],
  },
  {
    id: "fullstack-evidence",
    topic: "fullstack-evidence",
    keywords: ["full-stack", "fullstack", "full stack", "frontend", "backend", "web", "web app", "website", "commerce", "shopify", "next"],
    message:
      "Full-stack evidence runs through several projects: the B2B Commerce Platform (custom Shopify Liquid storefront paired with a headless Next.js portal — volume pricing, approval flows, Redis-cached catalog, 1.2s LCP p75 from field data after rebuild), the News Analyzer's comparison interface (Next.js over a transformer pipeline), and the backend layer across systems — FastAPI services, Redis caching and WebSocket streaming in the voice pipeline. He also builds production automation with n8n and FastAPI at Intellimind.",
    actions: [A.commerce, A.news, A.contact],
    followUps: ["Tell me about the commerce platform.", "What backend technologies does he use?", "How can I contact him?"],
  },
  {
    id: "strongest",
    topic: "strongest",
    keywords: ["strongest", "best", "favorite", "impressive", "top", "recommend", "most interesting", "standout"],
    message:
      "That's an assessment rather than a fact, but the portfolio makes a case for two: the Malaria Screening system is the flagship — it's the final-year research project, integrates real hardware (a motorized microscope over serial), and carries the strongest measured results (96.8% detection sensitivity on a held-out test set, <60ms per-frame inference on device). The Deepfake Detection Engine is the strongest pure-AI research piece — hybrid Xception-LSTM modeling with LIME explainability, 98.4% on a held-out FaceForensics++ benchmark. For applied automation, the outbound engine is the standout.",
    actions: [A.malaria, A.deepfake, A.automation],
    followUps: ["Tell me about the malaria project.", "Why is the deepfake model hybrid?", "What about the automation project?"],
  },
  {
    id: "explainable",
    topic: "explainable",
    keywords: ["explainable", "explainability", "interpretable", "interpretability", "lime", "heatmap", "transparent", "xai"],
    message:
      "The Deepfake Detection Engine is the explainable-AI project: LIME attributes each verdict back to specific facial regions, producing heatmaps a reviewer can inspect instead of trusting a bare score. The design philosophy there is that a forensic tool must be arguable — the heatmap exists so the model's decision can be checked, contested and audited.",
    actions: [A.deepfake, A.notes],
    followUps: ["Why does the model process frames in sequence?", "What accuracy did it achieve?", "What stack was used?"],
  },
  {
    id: "contact",
    topic: "contact",
    keywords: ["contact", "reach", "email", "hire", "available", "availability", "linkedin", "github", "touch", "message", "talk", "call"],
    message: `You can reach Talha by email (${IDENTITY.email}), on LinkedIn, or through the contact form on this page — he usually replies within a day. He's currently open to full-time roles and selective freelance work.`,
    actions: [...CONTACT_ACTIONS],
    followUps: ["Can I download his resume?", "Is he available for work?", "What does he specialize in?"],
  },
  {
    id: "resume",
    topic: "resume",
    keywords: ["resume", "cv", "download"],
    message:
      "Yes — the resume is on this page as a PDF. Use the button below and it downloads directly. It's the same file the Resume button in the navigation uses.",
    actions: [A.resume, A.contact],
    followUps: ["How can I contact him?", "What does Talha specialize in?"],
  },
  {
    id: "availability",
    topic: "availability",
    keywords: ["available", "opportunities", "freelance", "full-time", "fulltime", "open to work", "job", "role", "hiring", "remote", "relocate"],
    message:
      "Talha is available for new opportunities — full-time AI/ML or full-stack roles and selective freelance projects. He's based in Pakistan (UTC+5) and works remotely; he's currently building AI automation at Intellimind while finishing his CS degree. The fastest way to reach him is the contact form or email.",
    actions: [A.contact, A.email, A.resume],
    followUps: ["What does Talha specialize in?", "What are his AI projects?", "How can I contact him?"],
  },
  {
    id: "experience",
    topic: "experience",
    keywords: ["experience", "work", "worked", "career", "job", "jobs", "employer", "intellimind", "dev weekends", "code alpha", "teaching", "ta", "mentor", "internship"],
    message:
      "Current: AI Automation & Full-Stack Developer at Intellimind (Feb 2026–present) — AI automation, backend services, FastAPI pipelines, NLP assistants. He's also a Technical Speaker & AI Mentor at Dev Weekends (50+ developers mentored, from ideation to delivery), ran an independent AI & full-stack practice, worked as a Python Developer (AI domain) at Code Alpha (Mar–Jun 2025, NLP pipelines and chatbot modules), and served two teaching-assistant terms — Programming for AI (labs for 120+ students) and CS Fundamentals (80+ first-years).",
    actions: [A.experience, A.contact],
    followUps: ["What does he do at Intellimind?", "Has he mentored developers?", "Does he have NLP experience?"],
  },
  {
    id: "intellimind",
    topic: "intellimind",
    keywords: ["intellimind", "current", "now", "currently", "present"],
    message:
      "At Intellimind (remote, Feb 2026–present) Talha builds AI automation solutions, backend services and FastAPI pipelines, and develops NLP-driven assistants and automated business workflows — production work across the ML stack, from data pipelines to deployed models.",
    actions: [A.experience, A.automation],
    followUps: ["What are his AI projects?", "Does he have full-stack experience?", "How can I contact him?"],
  },
  {
    id: "education",
    topic: "education",
    keywords: ["education", "degree", "university", "study", "studying", "bs", "bachelor", "student", "final year", "graduating"],
    message:
      "Talha is in his final year of a BS in Computer Science with an AI concentration. His final-year research is the malaria screening system on this page — a microscope-integrated computer vision pipeline, which doubles as his strongest portfolio piece.",
    actions: [A.malaria, A.about],
    followUps: ["Tell me about the malaria project.", "What does Talha specialize in?"],
  },
  {
    id: "nlp",
    topic: "nlp",
    keywords: ["nlp", "natural language", "text", "summarization", "summarisation", "bert", "transformer", "chatbot", "assistant", "language"],
    message:
      "NLP evidence: the Cross-Source News Analyzer (transformer summarization with HuggingFace models, BERT embeddings for narrative clustering across 34 live sources — 91% cluster purity on internal evaluation), NLP chatbot modules built at Code Alpha, and the NLP-driven assistants he develops at Intellimind. The outbound automation engine also uses LLM APIs for audit-grounded outreach drafting.",
    actions: [A.news, A.contact],
    followUps: ["Tell me about the news project.", "What NLP work does he do at Intellimind?", "Where has he used BERT?"],
  },
  {
    id: "automation-evidence",
    topic: "automation-evidence",
    keywords: ["automation", "automate", "n8n", "workflow", "outreach", "lead", "leads", "scraping", "scraper", "audit", "auditing", "instantly", "email", "sales"],
    message:
      "The automation project is a self-hosted n8n pipeline that runs end to end with no human in the loop: scrapers collect qualified leads (Playwright, Python), headless-browser bots audit each target site for performance/UX/SEO gaps, an LLM drafts outreach grounded in those audit findings (no templates), and Instantly.ai dispatches with automated warmup and randomized intervals — reply webhooks feed responses back into the workflow. Measured result: 4.8× reply rate versus template outreach, in a campaign comparison.",
    actions: [A.automation, A.systems],
    followUps: ["How does the outreach stay non-generic?", "What stack powers it?", "Tell me about the audit step."],
  },
];

/* ── project entries (from the presented portfolio data) ─────── */
export const PROJECT_ENTRIES: KnowledgeEntry[] = [
  {
    id: "proj-malaria",
    topic: "malaria",
    keywords: ["malaria", "monolayer", "parasite", "parasitemia", "microscope", "microscopy", "biomedical", "blood", "slide", "giemsa", "plasmodium", "erythrocyte", "fyp", "final year"],
    message:
      "The Malaria Screening system is Talha's final-year project and the portfolio flagship. The problem: microscopists burn critical time navigating blood slides to find monolayer regions before diagnosis can even start. His system streams a live microscope feed over a serial interface, uses OpenCV morphological analysis to steer the stage toward monolayer zones, then a PyTorch CNN segments erythrocytes and classifies Plasmodium infections — with detections overlaid for the operator and a parasitemia report generated through FastAPI. Role: lead CV researcher & architect. Results: 96.8% detection sensitivity (held-out test set), <60ms per-frame inference (on-device benchmark), ~75% less slide scanning time (observed in lab trials).",
    actions: [A.malaria, A.cv, A.notes],
    followUps: ["Why does monolayer detection come first?", "What role did PyTorch play?", "What were the measured results?"],
  },
  {
    id: "proj-automation",
    topic: "automation",
    keywords: ["outbound", "cold", "email engine", "site audit", "seo", "instantly.ai", "llm outreach", "lead generation"],
    message:
      "The Outbound Automation engine is zero-touch lead generation: n8n orchestrates scrapers (Python, Playwright, BeautifulSoup) that collect qualified leads, headless bots audit each target site for performance/UX/SEO issues, an LLM drafts outreach grounded in those audit findings, and Instantly.ai dispatches with warmup and randomized intervals — reply webhooks close the loop. Talha designed the architecture end to end. Result: 4.8× reply rate versus template outreach, measured in a campaign comparison.",
    actions: [A.automation, A.systems],
    followUps: ["How does the outreach stay non-generic?", "What is the audit step?", "Which LLM APIs does it use?"],
  },
  {
    id: "proj-deepfake",
    topic: "deepfake",
    keywords: ["deepfake", "xception", "lstm", "fake", "forensic", "faceforensics", "temporal", "spatial"],
    message:
      "The Deepfake Detection Engine scores manipulation on two axes: an Xception backbone reads per-frame spatial artifacts, and an LSTM head reads frame sequences so temporal inconsistency — the strongest deepfake signal — contributes directly to the verdict. LIME explains every decision with facial-region heatmaps, and the model exports to ONNX behind a FastAPI service. Result: 98.4% accuracy on a held-out FaceForensics++ benchmark.",
    actions: [A.deepfake, A.experience],
    followUps: ["Why is the model hybrid?", "How does explainability work?", "What accuracy did it achieve?"],
  },
  {
    id: "proj-news",
    topic: "news",
    keywords: ["news", "bias", "aggregation", "journalism", "media", "sources", "clustering"],
    message:
      "The News & Bias Analyzer ingests 34 live news sources, summarizes coverage with transformer models (HuggingFace), embeds articles with BERT and clusters them to show how the same event is framed differently per outlet. Redis caches feeds between pipeline runs; a Next.js interface presents the comparison. Result: 91% cluster purity on internal evaluation, with the full pipeline completing in ~3.2s.",
    actions: [A.news, A.contact],
    followUps: ["What is cluster purity?", "Where is Redis used?", "What models does it use?"],
  },
  {
    id: "proj-commerce",
    topic: "commerce",
    keywords: ["commerce", "shopify", "storefront", "b2b", "wholesale", "pricing", "headless", "ecommerce", "catalog"],
    message:
      "The B2B Commerce Platform pairs a custom Shopify Liquid storefront with a headless Next.js portal for wholesale workflows — volume pricing, approval flows and a large catalog kept fast with Redis caching and GraphQL. Talha built both the storefront customization and the headless side. Result: 1.2s LCP p75 from field data after the rebuild.",
    actions: [A.commerce, A.contact],
    followUps: ["What is the headless architecture?", "Where is Redis used?", "Does he have full-stack experience?"],
  },
  {
    id: "proj-voice",
    topic: "voice",
    keywords: ["voice", "audio", "speech", "conversion", "librosa", "pyaudio", "streaming", "websocket"],
    message:
      "The Real-Time Voice Conversion Pipeline streams audio over WebSockets, extracts spectral features with Librosa, and applies overlap-add windowing to keep artifacts out of continuous live output. Talha built it for the hard constraint: sub-120ms round-trip latency (local benchmark) at 48kHz, because conversational use breaks past ~150ms.",
    actions: [A.voice, A.notes],
    followUps: ["How does the latency budget shape it?", "What stack was used?", "Where is WebSockets used?"],
  },
];

/* ── technology → evidence entries (mirrors the on-page tech map) ── */
const TECH_EVIDENCE: Record<string, string> = {
  pytorch:
    "PyTorch appears in two projects: Malaria Screening (training and inference for cell segmentation and parasite classification) and Deepfake Detection (Xception + LSTM training and inference).",
  opencv:
    "OpenCV is used in Malaria Screening (feed processing, stabilization and monolayer analysis) and Deepfake Detection (frame extraction and face alignment).",
  fastapi:
    "FastAPI backs the Malaria Screening report API and dashboard, and the backend services Talha builds at Intellimind.",
  nextjs:
    "Next.js powers the B2B Commerce headless portal and storefront, and the News Analyzer's comparison interface.",
  redis:
    "Redis caches the B2B Commerce catalog and the News Analyzer's feeds between pipeline runs.",
  n8n: "n8n orchestrates every stage of the Outbound Automation pipeline — scraping, auditing, personalization and dispatch.",
  playwright:
    "Playwright drives the Outbound Automation engine's headless site auditing and lead scraping.",
  lime: "LIME powers explainability in the Deepfake Detection engine — facial-region heatmaps that make each verdict auditable.",
  bert: "BERT provides article embeddings in the News Analyzer, used for narrative clustering across 34 sources.",
  transformers:
    "Transformer models (HuggingFace) do summarization and embedding in the News & Bias Analyzer.",
  librosa: "Librosa handles spectral feature extraction in the Real-Time Voice Conversion pipeline.",
  websockets:
    "WebSockets carry the streaming audio transport in the Voice Conversion pipeline.",
  shopify:
    "Shopify Liquid implements the B2B Commerce storefront customization and volume-pricing logic.",
  scikitlearn:
    "scikit-learn does embedding clustering and bias scoring in the News & Bias Analyzer.",
  "custom cnns":
    "Custom CNNs do erythrocyte segmentation and parasite classification in the Malaria Screening system.",
  "cnn-lstm":
    "CNN-LSTM hybrids are the fusion architecture in the Deepfake Detection engine — spatial artifacts plus temporal inconsistency.",
  "llm apis":
    "LLM APIs (OpenAI, Anthropic) draft audit-grounded outreach in the Outbound Automation engine.",
  streamlit: "Streamlit hosts the Malaria Screening operator dashboard alongside the FastAPI backend.",
};

const TECH_ENTRY_KEYWORDS: Record<string, string[]> = {
  pytorch: ["pytorch", "torch"],
  opencv: ["opencv", "cv2"],
  fastapi: ["fastapi"],
  nextjs: ["next.js", "nextjs", "next"],
  redis: ["redis"],
  n8n: ["n8n"],
  playwright: ["playwright", "puppeteer"],
  lime: ["lime"],
  bert: ["bert"],
  transformers: ["transformer", "huggingface", "hugging face"],
  librosa: ["librosa"],
  websockets: ["websocket", "websockets"],
  shopify: ["shopify", "liquid"],
  scikitlearn: ["scikit", "sklearn", "sk-learn"],
  "custom cnns": ["cnn", "cnns", "convolution", "segmentation model"],
  "cnn-lstm": ["cnn-lstm", "cnn lstm", "lstm"],
  "llm apis": ["llm", "openai", "anthropic", "gpt", "claude", "gemini"],
  streamlit: ["streamlit", "dashboard"],
};

const TECH_ENTRY_TITLES: Record<string, string> = {
  pytorch: "PyTorch",
  opencv: "OpenCV",
  fastapi: "FastAPI",
  nextjs: "Next.js",
  redis: "Redis",
  n8n: "n8n",
  playwright: "Playwright",
  lime: "LIME",
  bert: "BERT",
  transformers: "Transformers (HuggingFace)",
  librosa: "Librosa",
  websockets: "WebSockets",
  shopify: "Shopify Liquid",
  scikitlearn: "scikit-learn",
  "custom cnns": "Custom CNNs",
  "cnn-lstm": "CNN-LSTM hybrids",
  "llm apis": "LLM APIs",
  streamlit: "Streamlit",
};

for (const key of Object.keys(TECH_EVIDENCE)) {
  ENTRIES.push({
    id: `tech-${key}`,
    topic: key,
    keywords: TECH_ENTRY_KEYWORDS[key] ?? [key],
    message: `${TECH_ENTRY_TITLES[key]} — where it was actually used: ${TECH_EVIDENCE[key]}`,
    actions: [A.expertise, A.cv],
    followUps: ["What are his AI projects?", "What does Talha specialize in?", "How can I contact him?"],
  });
}

/* ── engineering notes — the "why" behind decisions ───────────── */
const NOTE_ACTIONS: Record<string, ChatAction[]> = {
  "malaria-screening": [A.malaria, A.notes],
  "outbound-automation": [A.automation, A.notes],
  "deepfake-detection": [A.deepfake, A.notes],
};

for (const note of NOTES) {
  ENTRIES.push({
    id: `note-${note.id}`,
    topic: note.projectId.replace("-screening", ""),
    keywords:
      note.id === "monolayer-first"
        ? ["monolayer detection come", "comes first", "monolayer first", "why monolayer", "pipeline order", "before anything"]
        : note.id === "audit-grounding"
          ? ["non-generic", "not generic", "stay non-generic", "generic outreach", "personalization honest"]
          : note.id === "temporal-signal"
            ? ["frames in sequence", "frame sequence", "sequential frames", "temporal signal", "why sequence"]
            : ["latency budget", "60ms", "milliseconds", "real-time constraint", "inference budget"],
    message: note.answer,
    actions: NOTE_ACTIONS[note.projectId] ?? [A.notes],
    followUps: ["Tell me more about that project.", "What technologies does it use?", "What were the results?"],
  });
}

export const ALL_ENTRIES: KnowledgeEntry[] = [...ENTRIES, ...PROJECT_ENTRIES];

/** Technologies mentioned in the toolkit but without project evidence on this site */
export const TOOLKIT_ONLY = [
  "TensorFlow", "Django", "Flask", ".NET", "PostgreSQL", "Docker",
  "Kubernetes", "Linux", "CI/CD", "Flutter", "REST & gRPC", "GraphQL",
  "MongoDB", "Puppeteer", "GraphQL", "AWS", "GCP", "Azure",
];

/** Vocabulary for off-topic detection */
export const PORTFOLIO_VOCAB = new Set<string>(
  ALL_ENTRIES.flatMap((e) => e.keywords)
    .concat(["talha", "qureshi", "project", "projects", "work", "experience", "skill", "skills", "expertise", "portfolio", "resume", "cv", "hire", "hiring", "contact", "email", "about", "stack", "build", "built", "builds", "use", "used", "uses", "using", "tech", "technology", "technologies", "ai", "ml", "machine", "learning", "vision", "nlp", "automation", "model", "models", "he", "his", "him", "who", "what", "which", "where", "why", "how", "tell", "show", "explain", "does", "is", "are", "can", " strongest", "year", "years", "2023", "2024", "2025", "2026"])
    .map((k) => k.toLowerCase().trim())
);
