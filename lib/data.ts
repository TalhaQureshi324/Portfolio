/**
 * Central content store — edit this file to update every section
 * of the portfolio (skills, projects, timeline, terminal payloads).
 */

export interface ProjectMetric {
  value: string;
  label: string;
}

export type ProjectViz = "malaria" | "automation";

export interface Project {
  id: string;
  num: string;
  title: string;
  platform: string;
  role?: string;
  tagline: string;
  problem: string;
  solution: string;
  stack: string[];
  flow: string[];
  metrics: ProjectMetric[];
  accent: "cyan" | "violet" | "emerald" | "mixed";
  viz?: ProjectViz;
  demo: string;
  repo: string;
}

export const PROJECTS: Project[] = [
  {
    id: "malaria-screening",
    num: "01",
    title: "AI-Guided Monolayer Detection & Automated Malaria Parasitemia Screening",
    platform: "Edge Computer Vision · Biomedical AI · Hardware-Integrated",
    role: "Lead CV Researcher & Architect — Final Year Project",
    tagline:
      "A microscope that navigates itself to the diagnostic zone and counts parasites in real time.",
    problem:
      "Manual malaria diagnosis from Giemsa-stained thin blood films is tedious, fatigue-prone and error-prone. Microscopists burn critical diagnostic time navigating slides hunting for monolayer regions where red blood cells don't clump or overlap.",
    solution:
      "A hardware-software interface streams the microscope feed live; OpenCV and deep morphological filters segment RBC density and steer the stage toward ideal thin-film monolayer zones. An end-to-end deep learning pipeline then segments erythrocytes and classifies Plasmodium parasites at the cellular level — with bounding-box overlays and real-time parasitemia quantification.",
    stack: ["PyTorch", "OpenCV", "Custom CNN", "Object Detection", "Serial HW Interface", "Streamlit", "FastAPI"],
    flow: ["MICROSCOPE FEED", "MONOLAYER ENGINE", "RBC SEGMENTATION", "PARASITE CNN", "PARASITEMIA REPORT"],
    metrics: [
      { value: "96.8%", label: "Detection sensitivity" },
      { value: "<60ms", label: "Real-time inference" },
      { value: "75%", label: "Scanning time cut" },
    ],
    accent: "cyan",
    viz: "malaria",
    demo: "#",
    repo: "#",
  },
  {
    id: "outbound-engine",
    num: "02",
    title: "Autonomous Lead Scraping, Technical Site Auditing & Cold Outreach Engine",
    platform: "Workflow Orchestration · LLM Agents · Outbound Infrastructure",
    role: "AI Automation & Systems Architect",
    tagline:
      "Zero-touch outbound: scrape, audit, personalize, dispatch — 5,000 times a week.",
    problem:
      "Manual outbound sales is repetitive data gathering, surface-level website inspection and cookie-cutter cold email — yielding sub-2% reply rates that get worse the more you scale them.",
    solution:
      "n8n orchestrates multi-source scrapers that ingest qualified domains and decision-makers. Headless-browser audit bots profile each target for performance bottlenecks, broken UX and SEO gaps. Findings become structured JSON payloads that drive an LLM agent to draft hyper-tailored, audit-backed pitch copy — dispatched through Instantly.ai with automated warmup, randomized intervals and reply webhooks.",
    stack: ["n8n", "Python", "Playwright", "Puppeteer", "BeautifulSoup", "OpenAI", "Anthropic", "Instantly.ai", "Webhooks"],
    flow: ["SCRAPER MODULE", "AUDIT BOT", "LLM PERSONALIZER", "INSTANTLY DISPATCH"],
    metrics: [
      { value: "100%", label: "Zero-touch automation" },
      { value: "4.8x", label: "Reply rate vs generic" },
      { value: "5,000+", label: "Audits / week" },
    ],
    accent: "violet",
    viz: "automation",
    demo: "#",
    repo: "#",
  },
  {
    id: "deepfake-detection",
    num: "03",
    title: "Synthetic Media & Deepfake Detection Engine",
    platform: "Computer Vision · Security",
    tagline:
      "Forensic analysis pipeline exposing AI-generated video in real time.",
    problem:
      "Deepfakes evade single-frame detectors: temporal inconsistencies between frames carry the strongest signal, but streaming inference must stay under 45ms per frame to be usable.",
    solution:
      "Hybrid Xception-CNN spatial encoder fused with an LSTM temporal head — frame-level artifacts and cross-frame inconsistency are scored jointly. LIME heatmaps make every verdict auditable, mapping decisions back to facial regions.",
    stack: ["PyTorch", "Xception", "LSTM", "OpenCV", "LIME", "FastAPI", "ONNX"],
    flow: ["INGEST", "FRAME EXTRACT", "XCEPTION CNN", "LSTM TEMPORAL", "LIME HEATMAP", "VERDICT"],
    metrics: [
      { value: "98.4%", label: "Detection accuracy" },
      { value: "<45ms", label: "Frame latency" },
      { value: "12k", label: "Frames / hour" },
    ],
    accent: "cyan",
    demo: "#",
    repo: "#",
  },
  {
    id: "news-nlp",
    num: "04",
    title: "Cross-Source NLP News Aggregation & Bias Analysis",
    platform: "NLP · Transformers",
    tagline:
      "One event, thirty-four outlets — summarized, clustered, and bias-scored automatically.",
    problem:
      "The same story reads like four different stories across outlets. Manual comparison doesn't scale and editorial bias hides in framing, not facts.",
    solution:
      "Transformer-based summarization condenses every article, embedding vectors cluster coverage by narrative frame, and a bias tensor scores lexical slant per source — visualized as a live, comparable timeline.",
    stack: ["Transformers", "HuggingFace", "BERT", "scikit-learn", "Redis", "Next.js"],
    flow: ["RSS SCRAPE", "DEDUPE", "SUMMARIZE", "EMBED", "CLUSTER", "BIAS REPORT"],
    metrics: [
      { value: "34", label: "Live sources" },
      { value: "91%", label: "Cluster purity" },
      { value: "3.2s", label: "Full pipeline" },
    ],
    accent: "violet",
    demo: "#",
    repo: "#",
  },
  {
    id: "b2b-commerce",
    num: "05",
    title: "Enterprise Commerce & B2B Web Ecosystem",
    platform: "Shopify · Headless",
    tagline:
      "Custom Liquid storefronts fused with a headless Next.js B2B portal.",
    problem:
      "Off-the-shelf themes crumbled under B2B requirements: volume pricing, approval flows, and 40k+ SKU catalogs pushed page loads past 4 seconds.",
    solution:
      "Custom Shopify Liquid architecture for the storefront core, with a headless Next.js frontend handling B2B workflows at the edge. Redis-cached catalog API and streaming SSR keep wholesale and retail sessions equally fast.",
    stack: ["Shopify Liquid", "Next.js", "Redis", "GraphQL", "Vercel Edge", "Node.js"],
    flow: ["SHOPIFY CORE", "STOREFRONT API", "NEXT.JS EDGE", "B2B PORTAL", "REDIS CACHE", "CDN"],
    metrics: [
      { value: "+120%", label: "Throughput" },
      { value: "1.2s", label: "LCP p75" },
      { value: "99.99%", label: "Uptime" },
    ],
    accent: "emerald",
    demo: "#",
    repo: "#",
  },
  {
    id: "voice-pipeline",
    num: "06",
    title: "Real-Time Voice Conversion & Audio Processing Pipeline",
    platform: "Audio · Streaming ML",
    tagline:
      "Sub-120ms round-trip voice conversion with clean spectral output.",
    problem:
      "Voice conversion models sound great offline but fall apart live: buffer overruns, spectral artifacts, and end-to-end latency far above the 150ms conversational threshold.",
    solution:
      "Librosa-driven spectral frontend with a voice conversion core optimized for streaming chunks, gTTS + SpeechRecognition bridging text and audio loops. Overlap-add windowing keeps output artifact-free under continuous load.",
    stack: ["Librosa", "gTTS", "SpeechRecognition", "PyAudio", "WebSockets", "NumPy"],
    flow: ["MIC CAPTURE", "VAD GATE", "SPECTROGRAM", "VOICE MODEL", "SYNTHESIS", "OUT STREAM"],
    metrics: [
      { value: "<120ms", label: "Round-trip" },
      { value: "48kHz", label: "Sample rate" },
      { value: "24/7", label: "Stream uptime" },
    ],
    accent: "mixed",
    demo: "#",
    repo: "#",
  },
];

export interface TimelineEntry {
  period: string;
  type: "FOUNDER" | "INDUSTRY" | "MENTOR" | "ACADEMIC" | "EDUCATION";
  role: string;
  org: string;
  points: string[];
  tags: string[];
}

export const TIMELINE: TimelineEntry[] = [
  {
    period: "FEB 2026 — PRESENT",
    type: "INDUSTRY",
    role: "AI Automation & Full-Stack Developer",
    org: "Intellimind · Remote",
    points: [
      "Building AI automation solutions, backend services and FastAPI pipelines running in production.",
      "Developing NLP-driven assistants and automated business workflows, working across the ML stack from data pipelines to deployed models.",
    ],
    tags: ["FastAPI", "NLP", "Automation", "Machine Learning"],
  },
  {
    period: "2025 — PRESENT",
    type: "MENTOR",
    role: "Technical Speaker & AI Mentor",
    org: "Dev Weekends · Lahore, PK",
    points: [
      "Delivered ML and backend engineering workshops to 50+ developers.",
      "Guiding student teams from initial product ideation through full project delivery.",
    ],
    tags: ["Public Speaking", "Mentorship", "ML Systems"],
  },
  {
    period: "2024 — PRESENT",
    type: "FOUNDER",
    role: "Founder & Lead Engineer",
    org: "Independent AI Systems Practice",
    points: [
      "Shipping end-to-end AI products: biomedical screening engines, zero-touch outbound automation, and bespoke commerce systems.",
      "Own the full stack — model training, inference infrastructure, API design, and production frontends.",
    ],
    tags: ["PyTorch", "Next.js", "n8n", "MLOps"],
  },
  {
    period: "MAR 2025 — JUN 2025",
    type: "INDUSTRY",
    role: "Python Developer (AI Domain)",
    org: "Code Alpha · Remote",
    points: [
      "Built NLP pipelines, chatbot modules and reusable ML components for client engagements.",
    ],
    tags: ["Python", "NLP", "Chatbots"],
  },
  {
    period: "2024",
    type: "ACADEMIC",
    role: "Teaching Assistant — Programming for AI",
    org: "Department of Computer Science",
    points: [
      "Led weekly labs for 120+ students across NumPy, Pandas, and PyTorch coursework.",
      "Designed autograded Jupyter assignments; pass rate for the module rose 14% year-over-year.",
    ],
    tags: ["NumPy", "PyTorch", "Pedagogy"],
  },
  {
    period: "2023",
    type: "ACADEMIC",
    role: "Teaching Assistant — CS Fundamentals",
    org: "Department of Computer Science",
    points: [
      "Mentored 80+ first-year students through data structures and algorithmic problem solving.",
      "Ran debugging clinics and code review sessions that became a permanent part of the course.",
    ],
    tags: ["DSA", "OOP", "Code Review"],
  },
  {
    period: "2022 — 2026",
    type: "EDUCATION",
    role: "BS Computer Science — AI Concentration",
    org: "Final Year · Deep Learning Research Track",
    points: [
      "Coursework concentration in computer vision, NLP, and distributed systems.",
      "Final-year research: AI-guided monolayer detection & automated malaria parasitemia screening.",
    ],
    tags: ["CNNs", "RNNs", "Biomedical CV"],
  },
];

/** Payload printed by the `skills --all` terminal command */
export const SKILLS_JSON = {
  ai_ml: {
    frameworks: ["PyTorch", "TensorFlow", "scikit-learn"],
    vision: ["OpenCV", "CNN", "Xception", "LSTM", "object detection", "biomedical imaging"],
    nlp: ["Transformers", "HuggingFace", "BERT", "Summarization", "Clustering"],
    explainability: ["LIME", "Saliency maps"],
  },
  automation: {
    orchestration: ["n8n (self-hosted)", "webhook architecture"],
    agents: ["OpenAI API", "Anthropic API", "LLM personalization"],
    scraping: ["Playwright", "Puppeteer", "BeautifulSoup"],
    outbound: ["Instantly.ai", "warmup + rotation strategies"],
  },
  backend: {
    frameworks: ["FastAPI", "Django", "Flask", ".NET"],
    datastores: ["PostgreSQL", "Redis", "MongoDB"],
    protocols: ["REST", "gRPC", "WebSockets", "GraphQL"],
  },
  frontend: {
    core: ["React", "Next.js", "TypeScript"],
    mobile: ["Flutter"],
    design: ["Figma-to-Code", "Tailwind CSS", "Framer Motion"],
    commerce: ["Shopify Liquid", "Headless", "B2B workflows"],
  },
  devops: {
    infra: ["Docker", "Kubernetes", "Linux"],
    ci_cd: ["GitHub Actions", "Automated pipelines"],
    arch: ["Microservices", "Serverless", "Edge caching"],
  },
} as const;

export const SOCIALS = {
  github: "https://github.com/TalhaQureshi324",
  linkedin: "https://www.linkedin.com/in/muhammad-talha-27b709331/",
  email: "mailto:iamtalhaqureshi849@gmail.com",
};
