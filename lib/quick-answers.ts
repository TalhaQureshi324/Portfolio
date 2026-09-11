import { NOTES } from "./data";
import { findTechMentions } from "./tech-evidence";

/**
 * INSTANT ANSWER LAYER — ready-made, evidence-grounded responses for
 * the common questions (suggestion chips, navigation commands) so they
 * answer in milliseconds with no LLM round-trip. Every line is sourced
 * from the same data the page renders; nothing here is invented.
 * Unknown questions return null and fall through to the LLM path.
 */

export interface QuickAction {
  label: string;
  type: string;
  target?: string;
  /** set on navigation commands — the UI runs these automatically */
  auto?: boolean;
}

export interface QuickResult {
  text: string;
  actions: QuickAction[];
  followUps: string[];
}

/* ── action library (types match the UI runAction switch) ────── */
const A = {
  malaria: { label: "View the malaria case study →", type: "scroll_to_project", target: "malaria-case-study" },
  outbound: { label: "See the automation pipeline →", type: "scroll_to_project", target: "outbound-automation" },
  deepfake: { label: "View deepfake detection →", type: "scroll_to_project", target: "deepfake-detection" },
  news: { label: "View the news analyzer →", type: "scroll_to_project", target: "news-nlp" },
  commerce: { label: "View the commerce platform →", type: "scroll_to_project", target: "b2b-commerce" },
  voice: { label: "View the voice pipeline →", type: "scroll_to_project", target: "voice-pipeline" },
  experience: { label: "View experience →", type: "scroll_to", target: "experience" },
  expertise: { label: "Open the tech map →", type: "scroll_to", target: "expertise" },
  contact: { label: "Open the contact form →", type: "scroll_to", target: "contact" },
  notes: { label: "Read the engineering notes →", type: "scroll_to", target: "notes" },
  systems: { label: "Explore the system architectures →", type: "scroll_to", target: "systems" },
  work: { label: "View selected work →", type: "scroll_to", target: "work" },
  resume: { label: "Open his resume →", type: "resume" },
  email: { label: "Email him →", type: "email" },
  github: { label: "Open GitHub →", type: "github" },
  linkedin: { label: "Open LinkedIn →", type: "linkedin" },
} satisfies Record<string, QuickAction>;

const NAV_VERB =
  /\b(take me|show me|go to|goto|jump to|scroll to|scroll|navigate|open|bring me|direct me|walk me|lead me|where is|where's|where are)\b/;

function nav(
  text: string,
  confirmation: string,
  action: QuickAction,
  followUps: string[]
): QuickResult {
  return {
    text: confirmation,
    actions: [{ ...action, auto: true }],
    followUps,
  };
}

/* ── navigation commands ─────────────────────────────────────── */
function navigation(q: string): QuickResult | null {
  if (!NAV_VERB.test(q)) return null;

  if (/\bmalaria|parasitemia|monolayer|blood slide|plasmodium\b/.test(q))
    return nav(q, "Taking you to the malaria screening case study — his featured final-year project.", A.malaria, [
      "How does the monolayer detector work?",
      "What results did the system achieve?",
      "What was Talha's role?",
    ]);
  if (/\bdeepfake|xception|faceforensics\b/.test(q))
    return nav(q, "Taking you to the deepfake detection engine.", A.deepfake, [
      "Why the hybrid Xception-LSTM?",
      "How does LIME explainability work?",
      "What accuracy was achieved?",
    ]);
  if (/\boutbound|outreach|site-?audit|cold email|leads?\b/.test(q))
    return nav(q, "Taking you to the autonomous outbound & site-audit automation.", A.outbound, [
      "How does the outreach stay non-generic?",
      "What stack powers the site audits?",
      "How would the pipeline scale?",
    ]);
  if (/\bnews|bias|aggregator|summariz|nlp\b/.test(q))
    return nav(q, "Taking you to the cross-source news aggregation & bias analysis.", A.news, [
      "How does the bias analysis work?",
      "How do 34 sources stay deduplicated?",
      "What models summarize the articles?",
    ]);
  if (/\bcommerce|shopify|headless|b2b|wholesale|lcp\b/.test(q))
    return nav(q, "Taking you to the B2B commerce platform.", A.commerce, [
      "What is the headless architecture?",
      "How did Redis caching help LCP?",
      "How do approval flows work?",
    ]);
  if (/\bvoice|speech|audio|librosa|round-?trip\b/.test(q))
    return nav(q, "Taking you to the real-time voice conversion pipeline.", A.voice, [
      "How is the latency budget managed?",
      "What does WebSockets handle?",
      "What was the round-trip latency?",
    ]);
  if (/\bexperience|career|work history|intellimind|jobs?\b/.test(q))
    return nav(q, "Taking you to his experience.", A.experience, [
      "What does he build at Intellimind?",
      "Does he have production AI experience?",
      "Does he have teaching experience?",
    ]);
  if (/\bskills?|expertise|tech(map| stack)|technolog|pytorch|toolkit\b/.test(q))
    return nav(q, "Opening the tech map — evidenced usage for every technology.", A.expertise, [
      "Where has he used PyTorch?",
      "What's his strongest CV project?",
      "Does he have full-stack experience?",
    ]);
  if (/\bnotes?\b|engineering notes|decisions\b/.test(q))
    return nav(q, "Taking you to the engineering notes.", A.notes, [
      "Why monolayer detection comes first",
      "How does the outreach stay non-generic?",
      "What does a latency budget change?",
    ]);
  if (/\barchitecture|diagram|system design|systems\b/.test(q))
    return nav(q, "Taking you to the system architectures.", A.systems, [
      "What is the malaria system architecture?",
      "How does the automation pipeline flow?",
      "What is the voice pipeline design?",
    ]);
  if (/\bprojects?|work|portfolio|builds?\b/.test(q))
    return nav(q, "Taking you to his selected work.", A.work, [
      "What are his strongest AI projects?",
      "Tell me about the malaria project.",
      "What technologies does he use?",
    ]);
  if (/\bcontact|reach|email him|get in touch\b/.test(q))
    return nav(q, "Opening the contact form — he usually replies within a day.", A.contact, [
      "What is his email?",
      "Is he available for full-time roles?",
      "Does he take freelance work?",
    ]);
  if (/\bresume|cv\b/.test(q))
    return nav(q, "Opening his resume.", A.resume, [
      "What are his strongest AI projects?",
      "What does he specialize in?",
      "How can I contact him?",
    ]);
  if (/\bgithub|code|repos?\b/.test(q))
    return nav(q, "Opening his GitHub.", A.github, [
      "What are his strongest AI projects?",
      "Tell me about the malaria project.",
      "How can I contact him?",
    ]);
  if (/\blinked?in\b/.test(q))
    return nav(q, "Opening his LinkedIn.", A.linkedin, [
      "What is his experience?",
      "How can I contact him?",
      "What does he specialize in?",
    ]);
  return null;
}

/* ── engineering-note questions reuse the page's own answers ─── */
function noteAnswer(q: string): QuickResult | null {
  if (/monolayer/.test(q) && /(why|how|first|before|work)/.test(q))
    return {
      text: NOTES[0].answer,
      actions: [A.malaria, A.notes],
      followUps: ["What results did the system achieve?", "What was Talha's role?", "What does a latency budget change?"],
    };
  if (/(non-?generic|personaliz|personalis|templates?)/.test(q) && /(outreach|email|audit|automation|how|why)/.test(q))
    return {
      text: NOTES[1].answer,
      actions: [A.outbound, A.notes],
      followUps: ["What stack powers the site audits?", "What reply rate did it achieve?", "How would the pipeline scale?"],
    };
  if (/(temporal|sequence|sequential|frames?|lstm|xception)/.test(q) && /(why|how|deepfake|work)/.test(q))
    return {
      text: NOTES[2].answer,
      actions: [A.deepfake, A.notes],
      followUps: ["What accuracy was achieved?", "How does LIME explainability work?", "What is his strongest CV project?"],
    };
  if (/(latency|real-?time|60ms|round-?trip)/.test(q) && !/voice|librosa|audio|speech|websockets/.test(q) && /(budget|pipeline|inference|why|how|manage)/.test(q))
    return {
      text: NOTES[3].answer,
      actions: [A.malaria, A.notes],
      followUps: ["What results did the system achieve?", "How is the pipeline architected?", "What was his role?"],
    };
  return null;
}

/* ── curated answers (all facts from data.ts) ────────────────── */
function curated(q: string): QuickResult | null {
  /* Specific JD-fit questions ("we need X and Y, is he a fit?") get full
     LLM reasoning. Generic why-hire / what's-unique questions get the
     instant pitch below. */
  const hiringWord = /\b(hire|hiring|recruiter|candidate|shortlist|suitable|qualified|fit)\b/.test(q);
  const jdSpecific =
    hiringWord &&
    (/(we need|we'?re hiring|we are hiring|looking for|requirement|job description|role (for|in|at)|position|opening|experience (with|in|using))/.test(q) ||
      /\b(redis|playwright|pytorch|react|next\.?js|node|python|fastapi|aws|kubernetes|docker|tensorflow)\b/.test(q));
  if (jdSpecific) return null;

  /* unique value / why hire */
  if (/\b(unique|differen(t|ce)|stand out|stands out|special\b|why (should|would|hire)|what (he )?(bring|brings|offer)|value proposition|convince|strengths?)\b/.test(q))
    return {
      text: "What makes Talha stand out, on documented evidence: he builds AI that reaches the physical world — his malaria system doesn't just classify images, it steers a real microscope stage over serial while holding per-frame inference under 60ms on-device. His automation is audit-grounded, not template spam — a 4.8× reply rate vs. template outreach in a campaign comparison. His deepfake forensics is inspectable — LIME heatmaps behind every verdict, 98.4% accuracy on a held-out FaceForensics++ benchmark. And he ships end-to-end: serial hardware → PyTorch → FastAPI and Next.js interfaces — while teaching 120+ students as a TA and mentoring 50+ developers. He's currently an AI Automation & Full-Stack Developer at Intellimind.",
      actions: [A.malaria, A.experience, A.contact],
      followUps: ["What are his strongest AI projects?", "What is his experience?", "How can I contact him?"],
    };

  /* malaria — with sub-intents */
  if (/\bmalaria|parasitemia|monolayer|plasmodium|blood slide\b/.test(q)) {
    if (/(result|accura|sensitiv|perform|metric|achiev|number)/.test(q))
      return {
        text: "Measured results, with their exact contexts: 96.8% detection sensitivity on a held-out test set, <60ms per-frame inference on the on-device benchmark, and ~75% less slide scanning time as observed in lab trials. The contexts matter — the sensitivity figure is a held-out test set, not a field deployment claim.",
        actions: [A.malaria, A.systems],
        followUps: ["How does the monolayer detector work?", "What was Talha's role?", "What is the system architecture?"],
      };
    if (/(role|who built|his part|contribution|responsib)/.test(q))
      return {
        text: "Talha was Lead Computer Vision Researcher & Architect — it's his final-year project (2025–2026). He designed the full pipeline: the serial interface that both reads and steers the microscope stage, the OpenCV monolayer navigation layer, and the PyTorch model that segments red blood cells and classifies Plasmodium infections.",
        actions: [A.malaria, A.experience],
        followUps: ["How does the monolayer detector work?", "What results did the system achieve?", "What is the system architecture?"],
      };
    return {
      text: "The malaria screening system is Talha's featured final-year project (2025–2026), where he was Lead Computer Vision Researcher & Architect. It reads a live microscope feed over serial, steers the stage toward usable monolayer regions with an OpenCV pipeline, then a PyTorch CNN segments individual red blood cells and classifies Plasmodium infections into a parasitemia estimate. Measured results: 96.8% detection sensitivity (held-out test set), <60ms per-frame inference (on-device benchmark), ~75% less slide scanning time (observed in lab trials).",
      actions: [A.malaria, A.systems],
      followUps: ["How does the monolayer detector work?", "What results did the system achieve?", "What was Talha's role?"],
    };
  }

  /* per-project summaries */
  if (/\bdeepfake|xception|faceforensics\b/.test(q))
    return {
      text: "The deepfake detection engine (2024, ML Researcher role) scores spatial artifacts and temporal inconsistency jointly with a hybrid Xception–LSTM network — how a face behaves across frames is a more durable signal than single-frame artifacts. It reached 98.4% accuracy on a held-out FaceForensics++ benchmark, and LIME heatmaps let every verdict be inspected region by region rather than trusted blindly.",
      actions: [A.deepfake, A.notes],
      followUps: ["Why the hybrid Xception-LSTM?", "How does LIME explainability work?", "What are his strongest AI projects?"],
    };
  if (/\boutbound|outreach|site-?audit|instantly\b/.test(q))
    return {
      text: "The autonomous outbound & site-audit automation (2025, AI Automation Architect role) is a self-hosted n8n pipeline: it scrapes qualified leads, audits each target site for performance and SEO gaps with Playwright, has an LLM draft outreach specific to those audit findings, and dispatches through Instantly.ai — no manual steps between target list and sent email. It achieved a 4.8× reply rate vs. template outreach in a campaign comparison.",
      actions: [A.outbound, A.notes],
      followUps: ["How does the outreach stay non-generic?", "What stack powers the site audits?", "How would the pipeline scale?"],
    };
  if (/\bnews|bias|aggregat|summariz|dedup|cluster\b/.test(q))
    return {
      text: "The cross-source news aggregation & bias analysis (2024, NLP Engineer role) runs transformer summarization and embedding-based clustering over 34 live news sources (continuous ingestion), surfacing how the same event is framed differently across outlets. It reached 91% cluster purity on internal evaluation. Stack: Transformers, HuggingFace, BERT, scikit-learn, Redis.",
      actions: [A.news, A.expertise],
      followUps: ["How does the bias analysis work?", "How do 34 sources stay deduplicated?", "What models summarize the articles?"],
    };
  if (/\bcommerce|shopify|headless|b2b|wholesale|approval|lcp\b/.test(q))
    return {
      text: "The B2B commerce platform (2024, Full-Stack Developer role) pairs a custom Shopify Liquid storefront with a headless Next.js portal for wholesale workflows — volume pricing, approval flows and a large catalog kept fast with Redis caching. Result: 1.2s LCP p75 on field data after the rebuild. Stack: Shopify Liquid, Next.js, Redis, GraphQL.",
      actions: [A.commerce, A.expertise],
      followUps: ["What is the headless architecture?", "How did Redis caching help LCP?", "How do approval flows work?"],
    };
  if (/\bvoice|speech|librosa|websockets|audio\b/.test(q))
    return {
      text: "The real-time voice conversion pipeline (2023, Audio Systems Developer role) is built on Librosa and WebSockets, using overlap-add windowing to keep spectral artifacts out of continuous live output. Round-trip latency: <120ms on a local benchmark. Stack: Python, Librosa, WebSockets, PyAudio.",
      actions: [A.voice, A.systems],
      followUps: ["How is the latency budget managed?", "What does WebSockets handle?", "What was the round-trip latency?"],
    };

  /* strongest projects */
  if (/(strongest|best|top|impressiv|notable|highlights?|showcase)/.test(q) && /(project|work|build)/.test(q))
    return {
      text: "Three stand out on documented evidence: the malaria screening system — 96.8% detection sensitivity on a held-out test set with <60ms per-frame on-device inference; the deepfake detection engine — 98.4% accuracy on a held-out FaceForensics++ benchmark with LIME explainability; and the autonomous outbound automation — a 4.8× reply rate vs. template outreach in a campaign comparison.",
      actions: [A.malaria, A.deepfake, A.outbound],
      followUps: ["Tell me about the malaria project.", "Why the hybrid Xception-LSTM?", "How does the outreach stay non-generic?"],
    };

  /* experience */
  if (/(experience|work history|career|intellimind|current(ly)? work|jobs?|teaching|mentor|\bta\b|background)/.test(q)) {
    if (/(intellimind|current)/.test(q))
      return {
        text: "Talha is an AI Automation & Full-Stack Developer at Intellimind (remote, Feb 2026–present), building AI automation solutions, backend services and FastAPI pipelines, plus NLP-driven assistants and automated business workflows. Alongside that he's a Technical Speaker & AI Mentor at Dev Weekends (Lahore, 2025–present).",
        actions: [A.experience, A.contact],
        followUps: ["What does he build at Intellimind?", "Does he have production AI experience?", "What is his strongest project?"],
      };
    if (/(teach|ta\b|mentor|students?)/.test(q))
      return {
        text: "Yes — he was a Teaching Assistant for Programming for AI (2024), leading weekly labs for 120+ students across NumPy, Pandas and PyTorch coursework, and for CS Fundamentals (2023), mentoring 80+ first-year students. He also delivers ML and backend workshops to 50+ developers as a Technical Speaker & AI Mentor at Dev Weekends (2025–present).",
        actions: [A.experience, A.expertise],
        followUps: ["What is his experience at Intellimind?", "Where does he currently work?", "Has he worked with PyTorch?"],
      };
    return {
      text: "His experience: AI Automation & Full-Stack Developer at Intellimind (remote, Feb 2026–present) — AI automation, FastAPI pipelines, NLP assistants; Technical Speaker & AI Mentor at Dev Weekends (2025–present, 50+ developers); independent AI & full-stack projects (2024–present); Python Developer (AI Domain) at Code Alpha (Mar–Jun 2025, NLP pipelines and chatbot modules); and two Teaching Assistant roles (Programming for AI 2024 with 120+ students, CS Fundamentals 2023 with 80+ students).",
      actions: [A.experience, A.contact],
      followUps: ["What does he build at Intellimind?", "Does he have teaching experience?", "What are his strongest projects?"],
    };
  }

  /* technology evidence — reuse the structured tech index */
  const mentions = findTechMentions(q);
  if (mentions.length > 0 && q.split(/\s+/).length <= 14) {
    const lines = mentions.map(
      (t) =>
        `${t.name} [${t.strength === "DIRECT_PROJECT" ? "direct project use" : "toolkit listing"}]: ${
          t.evidence.map((e) => `${e.title} — ${e.how}`).join("; ") ||
          "listed in his toolkit; no documented project use on this page"
        }`
    );
    return {
      text: lines.join("\n") + (mentions.some((m) => m.evidence.length) ? "\nAll from documented projects on this page." : ""),
      actions: [A.expertise],
      followUps: ["What are his strongest AI projects?", "What does he specialize in?", "How can I contact him?"],
    };
  }

  /* identity / specialization */
  if (/(who is|who's|about him|about talha|introduce|his story|education|student|university|based)/.test(q))
    return {
      text: "Muhammad Talha Qureshi (he prefers \"Talha\") is an AI/ML Engineer & Full-Stack Developer based in Pakistan (UTC+5), in his final year of a BS in Computer Science with an AI concentration. He currently works as an AI Automation & Full-Stack Developer at Intellimind (remote, Feb 2026–present) and mentors 50+ developers at Dev Weekends. He's open to full-time roles and selective freelance.",
      actions: [A.experience, A.contact],
      followUps: ["What does Talha specialize in?", "What are his strongest AI projects?", "How can I contact him?"],
    };
  if (/(specializ|what does he do|what do he build|focus|expertise|skills?|stack|technolog)/.test(q))
    return {
      text: "Talha specializes in applied AI engineering: computer-vision screening systems (malaria parasitemia detection), deepfake forensics (Xception-LSTM + LIME), LLM-driven automation (audit-grounded outreach), NLP aggregation (34 live sources), headless e-commerce (Next.js + Shopify, 1.2s LCP p75) and real-time audio AI (<120ms round-trip, local benchmark). Core stack: Python, PyTorch, OpenCV, FastAPI, Next.js.",
      actions: [A.expertise, A.work],
      followUps: ["What are his strongest AI projects?", "Where has he used PyTorch?", "Tell me about the malaria project."],
    };

  /* contact */
  if (/(contact|reach|email|hire|available|freelance|get in touch|full-?time)/.test(q))
    return {
      text: "Talha is open to full-time roles and selective freelance, and usually replies within a day. Email: iamtalhaqureshi849@gmail.com. You can also use the contact form on this page, or find him on LinkedIn (muhammad-talha-27b709331) and GitHub (TalhaQureshi324).",
      actions: [A.contact, A.email, A.linkedin],
      followUps: ["What does he specialize in?", "What is his experience?", "What are his strongest AI projects?"],
    };

  return null;
}

/**
 * Instant answer for a question, or null to use the LLM path.
 * `recentContext` (recent conversation text) resolves topical
 * follow-ups like "What results did the system achieve?" to the
 * project just discussed.
 */
export function quickAnswer(question: string, recentContext = ""): QuickResult | null {
  const q = question.toLowerCase().trim();
  if (!q) return null;

  const ctx = recentContext.toLowerCase();
  const topic = /(malaria|monolayer|parasitemia|plasmodium)/.test(ctx)
    ? " malaria"
    : /(deepfake|xception|lime|faceforensics)/.test(ctx)
      ? " deepfake"
      : /(outbound|outreach|site-?audit)/.test(ctx)
        ? " outbound"
        : /(news|bias analysis|aggregat)/.test(ctx)
          ? " news"
          : /(commerce|shopify|headless)/.test(ctx)
            ? " commerce"
            : /(voice|librosa|websockets)/.test(ctx)
              ? " voice"
              : "";
  const effective =
    topic &&
    q.split(/\s+/).length <= 8 &&
    /(result|role|accura|achiev|how|why|scale|stack|latency|round-?trip|architect|dedup|summar|models?|sources?|approval|lcp|headless|websockets?|personaliz|non-?generic)/.test(q)
      ? q + topic
      : q;

  return navigation(q) ?? noteAnswer(q) ?? curated(effective);
}

/**
 * RESILIENT FALLBACK — broad keyword matching over the same curated,
 * evidence-grounded answers. Used only when the LLM path fails, so a
 * provider outage never leaves a known question type unanswered.
 * Returns null only for genuinely unknown questions.
 */
export function fallbackAnswer(question: string, recentContext = ""): QuickResult | null {
  const strict = quickAnswer(question, recentContext);
  if (strict) return strict;
  const q = question.toLowerCase();
  /* hiring questions get the hire pitch — never the contact answer */
  if (/\b(hire|hiring|recruiter|candidate|shortlist|fit|suitable|qualified)\b/.test(q))
    return {
      text: "On documented evidence, Talha is a strong hire for AI engineering roles: he builds AI that reaches the physical world — his malaria system steers a real microscope stage over serial while holding per-frame inference under 60ms on-device. His automation is audit-grounded, not template spam (4.8× reply rate vs. template outreach, campaign comparison). His deepfake forensics is inspectable (LIME heatmaps, 98.4% accuracy on a held-out FaceForensics++ benchmark). And he ships end-to-end: serial hardware → PyTorch → FastAPI and Next.js interfaces.",
      actions: [A.malaria, A.experience, A.contact],
      followUps: ["What are his strongest AI projects?", "What is his experience?", "How can I contact him?"],
    };
  if (/\b(project|built|build|portfolio|case study|app|system|pipeline)\b/.test(q))
    return {
      text: "His documented projects: the AI-guided malaria screening system (96.8% detection sensitivity, held-out test set; <60ms per-frame on-device), the deepfake detection engine (98.4% accuracy, held-out FaceForensics++ benchmark, LIME explainability), the autonomous outbound & site-audit automation (4.8× reply rate vs. template outreach, campaign comparison), the cross-source news aggregator (34 live sources, 91% cluster purity), the B2B commerce platform (1.2s LCP p75, field data after rebuild) and the real-time voice pipeline (<120ms round-trip, local benchmark).",
      actions: [A.work, A.malaria],
      followUps: ["Tell me about the malaria project.", "What are his strongest AI projects?", "What does he specialize in?"],
    };
  if (/\b(experience|work|industry|professional|production|company|job|employ)\b/.test(q))
    return {
      text: "He's currently an AI Automation & Full-Stack Developer at Intellimind (remote, Feb 2026–present) — AI automation, FastAPI pipelines, NLP assistants. Before that: ML/NLP/full-stack project work (2024–present), Code Alpha (Mar–Jun 2025), two Teaching Assistant roles (120+ and 80+ students), and ML workshops for 50+ developers at Dev Weekends.",
      actions: [A.experience, A.contact],
      followUps: ["What does he build at Intellimind?", "What are his strongest projects?", "How can I contact him?"],
    };
  if (/\b(skill|tech|stack|tools?|language|framework)\b/.test(q))
    return {
      text: "Core stack: Python, PyTorch, OpenCV, FastAPI, Next.js, plus n8n, Playwright, Redis, WebSockets, LIME, BERT/Transformers, Shopify and Streamlit — each tied to a documented project on this page (the tech map shows exactly where).",
      actions: [A.expertise, A.work],
      followUps: ["Where has he used PyTorch?", "What are his strongest AI projects?", "What does he specialize in?"],
    };
  if (/\b(who|about|introduce|background|person)\b/.test(q))
    return {
      text: "Muhammad Talha Qureshi (he prefers \"Talha\") is an AI/ML Engineer & Full-Stack Developer based in Pakistan (UTC+5), final-year BS Computer Science with an AI concentration, currently an AI Automation & Full-Stack Developer at Intellimind (remote, Feb 2026–present) and mentor to 50+ developers at Dev Weekends.",
      actions: [A.experience, A.contact],
      followUps: ["What does Talha specialize in?", "What are his strongest AI projects?", "How can I contact him?"],
    };
  if (/\b(contact|email|reach|touch)\b/.test(q))
    return {
      text: "You can reach Talha at iamtalhaqureshi849@gmail.com — he's open to full-time roles and selective freelance, and usually replies within a day.",
      actions: [A.contact, A.email],
      followUps: ["What does he specialize in?", "What is his experience?", "What are his strongest projects?"],
    };
  return null;
}
