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

/* ── Expertise ───────────────────────────────────────────────── */
export const EXPERTISE: Array<{ category: string; items: string[] }> = [
  { category: "AI / ML", items: ["PyTorch", "TensorFlow", "scikit-learn", "Transformers & Hugging Face", "LIME"] },
  { category: "Computer Vision", items: ["OpenCV", "CNNs", "Object detection", "CNN-LSTM hybrids", "Biomedical imaging"] },
  { category: "Backend", items: ["Python", "FastAPI", "Django", "Flask", ".NET", "PostgreSQL", "Redis", "REST & gRPC"] },
  { category: "Frontend", items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Flutter", "Shopify & Liquid"] },
  { category: "Automation", items: ["n8n", "Playwright & Puppeteer", "OpenAI & Anthropic APIs", "Webhook architecture"] },
  { category: "Infrastructure", items: ["Docker", "Linux", "Git & CI/CD", "Microservices fundamentals"] },
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
