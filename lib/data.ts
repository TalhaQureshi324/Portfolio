/**
 * Central content store — all site copy lives here.
 * Metrics are real project results with their measurement context.
 */

export interface ContextMetric {
  value: string;
  label: string;
  context: string;
}

export interface Project {
  id: string;
  index: string;
  title: string;
  year: string;
  role: string;
  description: string;
  stack: string[];
  metrics?: ContextMetric[];
}

/* ── Featured case study ─────────────────────────────────────── */
export const FEATURED = {
  id: "malaria-screening",
  index: "01",
  eyebrow: "Featured — Final-Year Project",
  title: "AI-Guided Monolayer Detection & Automated Malaria Parasitemia Screening",
  role: "Lead Computer Vision Researcher & Architect",
  domain: "Computer Vision · Biomedical Imaging · Hardware Integration",
  timeline: "2025 — 2026",
  summary:
    "Manual malaria diagnosis depends on microscopists finding the right part of a blood slide before they can even start counting. My final-year project automates that step: it reads a live microscope feed, steers the stage toward usable monolayer regions, and screens for Plasmodium parasites cell by cell.",
  problem:
    "Reading a Giemsa-stained thin blood film by hand is slow and fatiguing, and accuracy degrades as operators tire. Much of the time is spent simply navigating the slide to find monolayer regions — areas where red blood cells are separated rather than clumped — before diagnosis can begin.",
  approach:
    "I built the system in three layers. A hardware interface streams the microscope feed over serial, so the software can both see and steer the stage. An OpenCV pipeline segments red-cell density and morphological structure to guide navigation toward monolayer zones. A deep learning model then segments individual erythrocytes and classifies Plasmodium infections, producing a parasitemia estimate with per-cell detection overlays for the operator to review.",
  results: [
    { value: "96.8%", label: "Detection sensitivity", context: "held-out test set" },
    { value: "<60ms", label: "Per-frame inference", context: "on-device benchmark" },
    { value: "~75%", label: "Less slide scanning time", context: "observed in lab trials" },
  ] as ContextMetric[],
  stack: ["Python", "PyTorch", "OpenCV", "Custom CNN", "Object Detection", "Serial Interface", "Streamlit", "FastAPI"],
  flow: ["Microscope feed", "Monolayer engine", "RBC segmentation", "Parasite classifier", "Screening report"],
};

/* ── Selected projects ───────────────────────────────────────── */
export const PROJECTS: Project[] = [
  {
    id: "outbound-automation",
    index: "02",
    title: "Autonomous Outbound & Site-Audit Automation",
    year: "2025",
    role: "AI Automation Architect",
    description:
      "A self-hosted n8n pipeline that scrapes qualified leads, audits each target site for performance and SEO gaps, has an LLM draft audit-specific outreach, and dispatches through Instantly.ai — no manual steps between target list and sent email.",
    stack: ["n8n", "Python", "Playwright", "LLM APIs", "Instantly.ai", "Webhooks"],
    metrics: [
      { value: "4.8×", label: "Reply rate vs. template outreach", context: "campaign comparison" },
    ],
  },
  {
    id: "deepfake-detection",
    index: "03",
    title: "Deepfake Detection Engine",
    year: "2024",
    role: "ML Researcher",
    description:
      "A hybrid Xception–LSTM network that scores spatial artifacts and temporal inconsistency jointly, with LIME heatmaps so every verdict can be inspected rather than trusted blindly.",
    stack: ["PyTorch", "Xception", "LSTM", "LIME", "OpenCV"],
    metrics: [
      { value: "98.4%", label: "Accuracy", context: "held-out benchmark (FaceForensics++)" },
    ],
  },
  {
    id: "news-nlp",
    index: "04",
    title: "Cross-Source News Aggregation & Bias Analysis",
    year: "2024",
    role: "NLP Engineer",
    description:
      "Transformer summarization and embedding-based clustering over thirty-four live news sources, surfacing how the same event is framed differently across outlets.",
    stack: ["Transformers", "HuggingFace", "BERT", "scikit-learn", "Redis"],
    metrics: [
      { value: "34", label: "Live sources", context: "continuous ingestion" },
      { value: "91%", label: "Cluster purity", context: "internal evaluation" },
    ],
  },
  {
    id: "b2b-commerce",
    index: "05",
    title: "B2B Commerce Platform",
    year: "2024",
    role: "Full-Stack Developer",
    description:
      "Custom Shopify Liquid storefront paired with a headless Next.js portal for wholesale workflows — volume pricing, approval flows and a large catalog kept fast with Redis caching.",
    stack: ["Shopify Liquid", "Next.js", "Redis", "GraphQL"],
    metrics: [
      { value: "1.2s", label: "LCP p75", context: "field data after rebuild" },
    ],
  },
  {
    id: "voice-pipeline",
    index: "06",
    title: "Real-Time Voice Conversion Pipeline",
    year: "2023",
    role: "Audio Systems Developer",
    description:
      "A streaming voice-conversion pipeline built on Librosa and WebSockets, using overlap-add windowing to keep spectral artifacts out of continuous live output.",
    stack: ["Python", "Librosa", "WebSockets", "PyAudio"],
    metrics: [
      { value: "<120ms", label: "Round-trip latency", context: "local benchmark" },
    ],
  },
];

/* ── Experience ──────────────────────────────────────────────── */
export interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  location?: string;
  points: string[];
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    period: "Feb 2026 — Present",
    role: "AI Automation & Full-Stack Developer",
    org: "Intellimind",
    location: "Remote",
    points: [
      "Building AI automation solutions, backend services and FastAPI pipelines.",
      "Developing NLP-driven assistants and automated business workflows.",
    ],
  },
  {
    period: "2025 — Present",
    role: "Technical Speaker & AI Mentor",
    org: "Dev Weekends",
    location: "Lahore, PK",
    points: [
      "Delivered ML and backend engineering workshops to 50+ developers.",
      "Guiding student teams from initial product ideation through full project delivery.",
    ],
  },
  {
    period: "2024 — Present",
    role: "Independent AI & Full-Stack Projects",
    org: "Self-directed practice",
    points: [
      "Client and personal builds across applied ML, automation and web platforms — including the projects featured on this site.",
    ],
  },
  {
    period: "Mar 2025 — Jun 2025",
    role: "Python Developer (AI Domain)",
    org: "Code Alpha",
    location: "Remote",
    points: [
      "Built NLP pipelines, chatbot modules and reusable ML components.",
    ],
  },
  {
    period: "2024",
    role: "Teaching Assistant — Programming for AI",
    org: "Department of Computer Science",
    points: [
      "Led weekly labs for 120+ students across NumPy, Pandas and PyTorch coursework.",
    ],
  },
  {
    period: "2023",
    role: "Teaching Assistant — CS Fundamentals",
    org: "Department of Computer Science",
    points: [
      "Mentored 80+ first-year students through data structures and problem solving.",
    ],
  },
];

/* ── Interactive tech map — evidenced usage only ─────────────── */
export interface TechUse {
  projectId: string;
  use: string;
}
export interface TechEntry {
  name: string;
  category: string;
  uses: TechUse[];
}

export const PROJECT_SHORT: Record<string, string> = {
  "malaria-screening": "Malaria Screening",
  "outbound-automation": "Outbound Automation",
  "deepfake-detection": "Deepfake Detection",
  "news-nlp": "News & Bias Analyzer",
  "b2b-commerce": "B2B Commerce",
  "voice-pipeline": "Voice Pipeline",
};

export const TECH_MAP: TechEntry[] = [
  { name: "PyTorch", category: "AI / ML", uses: [
    { projectId: "malaria-screening", use: "Training & inference for cell segmentation and parasite classification" },
    { projectId: "deepfake-detection", use: "Xception + LSTM training and inference" },
  ]},
  { name: "scikit-learn", category: "AI / ML", uses: [
    { projectId: "news-nlp", use: "Embedding clustering and bias scoring" },
  ]},
  { name: "Transformers", category: "AI / ML", uses: [
    { projectId: "news-nlp", use: "Summarization and article embeddings (Hugging Face)" },
  ]},
  { name: "LIME", category: "AI / ML", uses: [
    { projectId: "deepfake-detection", use: "Verdict attribution — facial-region heatmaps" },
  ]},
  { name: "Librosa", category: "AI / ML", uses: [
    { projectId: "voice-pipeline", use: "Spectral feature extraction for the conversion model" },
  ]},
  { name: "OpenCV", category: "Computer Vision", uses: [
    { projectId: "malaria-screening", use: "Feed processing, stabilization and monolayer analysis" },
    { projectId: "deepfake-detection", use: "Frame extraction and face alignment" },
  ]},
  { name: "Custom CNNs", category: "Computer Vision", uses: [
    { projectId: "malaria-screening", use: "Erythrocyte segmentation and parasite classification" },
  ]},
  { name: "CNN-LSTM hybrids", category: "Computer Vision", uses: [
    { projectId: "deepfake-detection", use: "Spatial + temporal fusion architecture" },
  ]},
  { name: "BERT", category: "NLP", uses: [
    { projectId: "news-nlp", use: "Article representation for narrative clustering" },
  ]},
  { name: "FastAPI", category: "Backend", uses: [
    { projectId: "malaria-screening", use: "Screening report API and dashboard backend" },
  ]},
  { name: "Redis", category: "Backend", uses: [
    { projectId: "b2b-commerce", use: "Catalog caching for the headless portal" },
    { projectId: "news-nlp", use: "Feed caching between pipeline runs" },
  ]},
  { name: "WebSockets", category: "Backend", uses: [
    { projectId: "voice-pipeline", use: "Streaming audio transport for live conversion" },
  ]},
  { name: "Next.js", category: "Frontend", uses: [
    { projectId: "b2b-commerce", use: "Headless B2B portal and storefront" },
    { projectId: "news-nlp", use: "Coverage comparison interface" },
  ]},
  { name: "Shopify Liquid", category: "Frontend", uses: [
    { projectId: "b2b-commerce", use: "Custom storefront theming and B2B pricing logic" },
  ]},
  { name: "n8n", category: "Automation", uses: [
    { projectId: "outbound-automation", use: "Orchestrates every pipeline stage" },
  ]},
  { name: "Playwright", category: "Automation", uses: [
    { projectId: "outbound-automation", use: "Headless site auditing and lead scraping" },
  ]},
  { name: "LLM APIs", category: "Automation", uses: [
    { projectId: "outbound-automation", use: "Audit-grounded outreach drafting (OpenAI, Anthropic)" },
  ]},
];

/** Capabilities without a mapped project on this site — kept honest, kept brief. */
export const EXTRA_TOOLS = [
  "TensorFlow", "Django & Flask", ".NET", "PostgreSQL", "Docker",
  "Linux", "CI/CD", "Flutter", "REST & gRPC", "Puppeteer",
];

/* ── Interactive architecture explorer ───────────────────────── */
export interface SystemNode {
  id: string;
  label: string;
  title: string;
  detail: string;
  tags: string[];
  core?: boolean;
}
export interface SystemSpec {
  id: string;
  name: string;
  tagline: string;
  nodes: SystemNode[];
}

export const SYSTEMS: SystemSpec[] = [
  {
    id: "malaria",
    name: "Malaria AI",
    tagline: "The final-year project — a microscope that finds the diagnostic zone and screens it, end to end.",
    nodes: [
      { id: "feed", label: "Microscope feed", title: "Live slide acquisition", tags: ["Serial interface", "OpenCV"],
        detail: "The digital microscope's camera is read over a serial link, so the software gets a live view of the slide — and can drive the stage itself. Everything downstream works on this stream." },
      { id: "preprocess", label: "Preprocessing", title: "Stabilize & normalize", tags: ["OpenCV", "NumPy"],
        detail: "Frames are stabilized and color-normalized to absorb inconsistent Giemsa staining and lighting drift between sessions, so the model sees comparable input every time." },
      { id: "monolayer", label: "Monolayer detection", title: "The core contribution", core: true, tags: ["OpenCV", "Morphological analysis", "Stage control"],
        detail: "Red-cell density and morphological structure are scored per field of view, and the stage is steered toward regions where cells sit apart instead of clumping. This is the navigation step that used to eat a microscopist's time." },
      { id: "classify", label: "Cell detection", title: "Cell-level screening", tags: ["PyTorch", "Custom CNN", "Object detection"],
        detail: "A CNN segments individual erythrocytes, then classifies each cell for Plasmodium infection. Detections overlay the live feed so an operator can verify every call." },
      { id: "report", label: "Screening report", title: "Parasitemia output", tags: ["FastAPI", "Streamlit"],
        detail: "Infected-cell counts convert into a parasitemia estimate with confidence bounds, delivered as a reviewable screening report through a FastAPI-backed dashboard." },
    ],
  },
  {
    id: "automation",
    name: "Lead Automation",
    tagline: "The zero-touch outbound engine — from raw target list to sent, grounded email with no human in the loop.",
    nodes: [
      { id: "sources", label: "Lead sources", title: "Multi-source ingestion", tags: ["Python", "Playwright", "BeautifulSoup"],
        detail: "Scrapers collect candidate domains and decision-maker contacts from directories, search results and market lists — the raw fuel for everything downstream." },
      { id: "qualify", label: "Qualification", title: "Filter & dedupe", tags: ["n8n", "Python"],
        detail: "Rule-based filtering and deduplication turn raw scrapes into a clean, qualified target list inside n8n — before anything expensive happens downstream." },
      { id: "audit", label: "Website audit", title: "Headless technical audit", tags: ["Playwright", "Puppeteer"],
        detail: "Headless browser bots profile every target: performance bottlenecks, broken UX patterns, technical SEO gaps — condensed into a structured findings payload." },
      { id: "personalize", label: "LLM outreach", title: "Audit-grounded personalization", core: true, tags: ["OpenAI API", "Anthropic API"],
        detail: "The audit findings become the prompt context; an LLM drafts outreach that references the target's actual problems. Zero generic templates — every email is grounded in that site's own data." },
      { id: "dispatch", label: "Dispatch & replies", title: "Send, warm, listen", tags: ["Instantly.ai", "Webhooks"],
        detail: "Instantly.ai handles delivery with automated warmup and randomized sending intervals; reply webhooks feed responses back into the workflow for follow-up." },
    ],
  },
  {
    id: "deepfake",
    name: "Deepfake Detection",
    tagline: "Forensic video analysis where the model not only decides — it shows its reasoning.",
    nodes: [
      { id: "intake", label: "Video intake", title: "Frame extraction & alignment", tags: ["OpenCV"],
        detail: "Input video is sampled into frames, with face regions detected and aligned so the model always sees comparable geometry." },
      { id: "spatial", label: "Spatial encoder", title: "Per-frame artifact scoring", tags: ["PyTorch", "Xception", "Transfer learning"],
        detail: "An Xception backbone scores each frame for manipulation artifacts — the spatial half of the verdict." },
      { id: "temporal", label: "Temporal model", title: "Cross-frame consistency", core: true, tags: ["LSTM", "Sequence modeling"],
        detail: "An LSTM head reads frame sequences, so inconsistencies between frames — the strongest deepfake signal — contribute directly to the verdict instead of being averaged away." },
      { id: "explain", label: "Explainability", title: "Auditable verdicts", tags: ["LIME"],
        detail: "LIME attributes each verdict back to specific facial regions, producing heatmaps a reviewer can inspect — a diagnosis you can argue with, not a bare score." },
      { id: "serve", label: "Verdict service", title: "Low-latency inference API", tags: ["ONNX", "FastAPI"],
        detail: "The trained model is exported to ONNX and wrapped in FastAPI for lower-latency batch and streaming inference." },
    ],
  },
];

/* ── Contact / social ────────────────────────────────────────── */
export const SOCIALS = {
  github: "https://github.com/TalhaQureshi324",
  linkedin: "https://www.linkedin.com/in/muhammad-talha-27b709331/",
  email: "mailto:iamtalhaqureshi849@gmail.com",
  emailDisplay: "iamtalhaqureshi849@gmail.com",
};

export const SCOPES = ["AI / ML project", "Full-stack application", "Automation workflow", "Something else"];
export const BUDGETS = ["< $1k", "$1k – $5k", "$5k – $15k", "Enterprise"];
