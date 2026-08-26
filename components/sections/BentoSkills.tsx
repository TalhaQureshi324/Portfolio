"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Boxes, BrainCircuit, MonitorSmartphone, Server } from "lucide-react";
import BentoCard from "@/components/ui/BentoCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function CardHeader({
  icon: Icon,
  title,
  tag,
  accent,
}: {
  icon: typeof Server;
  title: string;
  tag: string;
  accent: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={cn("rounded-lg border p-2 bg-white/[0.03]", accent)}>
          <Icon size={18} />
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      </div>
      <span className="font-mono text-[10px] tracking-[0.15em] text-slate-600">{tag}</span>
    </div>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyanx/40 hover:text-cyanx">
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   1 — AI & ML ENGINE: live inference pipeline visualizer
   ───────────────────────────────────────────────────────────── */
const STAGES = [
  { name: "INPUT", ms: 2.1 },
  { name: "PREPROC", ms: 5.4 },
  { name: "XCEPTION", ms: 17.8 },
  { name: "LSTM", ms: 11.2 },
  { name: "HEAD", ms: 3.6 },
];
const MAX_STAGE_MS = 22;

function AICard() {
  const [stageMs, setStageMs] = useState(() => STAGES.map((s) => s.ms));
  const [accuracy, setAccuracy] = useState(98.4);

  // Deterministic first paint; live jitter only after mount
  useEffect(() => {
    const id = setInterval(() => {
      setStageMs(STAGES.map((s) => +(s.ms * (0.88 + Math.random() * 0.24)).toFixed(1)));
      setAccuracy(+(98.4 + (Math.random() - 0.5) * 0.5).toFixed(2));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const total = stageMs.reduce((a, b) => a + b, 0);
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <BentoCard variants={cardVariants} className="md:col-span-4">
      <div className="p-6 sm:p-7">
        <CardHeader
          icon={BrainCircuit}
          title="AI & Machine Learning Engine"
          tag="ml_core.engine"
          accent="border-cyanx/30 text-cyanx"
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* Pipeline stages with live latency bars */}
          <div className="flex-1 space-y-2.5">
            {STAGES.map((stage, i) => (
              <div key={stage.name} className="flex items-center gap-3">
                <span className="w-20 shrink-0 font-mono text-[10px] tracking-wider text-slate-400">
                  {stage.name}
                </span>
                <div className="h-4 flex-1 overflow-hidden rounded-sm bg-white/[0.04]">
                  <motion.div
                    className={cn(
                      "h-full rounded-sm",
                      i === 2
                        ? "bg-gradient-to-r from-cyanx to-azure"
                        : i === 3
                          ? "bg-gradient-to-r from-violetx to-magenta"
                          : "bg-white/20"
                    )}
                    animate={{ width: `${(stageMs[i] / MAX_STAGE_MS) * 100}%` }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-[10px] text-cyanx/80">
                  {stageMs[i].toFixed(1)}ms
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-500">
              <span>pipeline · live inference</span>
              <span className="text-slate-300">Σ {total.toFixed(1)}ms / frame</span>
            </div>
          </div>

          {/* Accuracy gauge */}
          <div className="flex shrink-0 items-center gap-5 self-start lg:self-auto">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r={R} fill="none"
                  stroke="#00F5A0" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={C}
                  animate={{ strokeDashoffset: C * (1 - accuracy / 100) }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-emeraldx">
                {accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="font-mono text-[10px] leading-relaxed text-slate-500">
              <p className="text-emeraldx">accuracy</p>
              <p>val split · n=48k</p>
              <p> Hybrid CNN-LSTM</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["PyTorch", "TensorFlow", "OpenCV", "Transformers", "CNN-LSTM", "Biomedical CV", "LIME"].map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}

/* ─────────────────────────────────────────────────────────────
   2 — BACKEND: animated request throughput indicator
   ───────────────────────────────────────────────────────────── */
function BackendCard() {
  const [rps, setRps] = useState(2417);
  useEffect(() => {
    const id = setInterval(() => setRps(2100 + Math.floor(Math.random() * 700)), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <BentoCard variants={cardVariants} className="md:col-span-2">
      <div className="flex h-full flex-col p-6 sm:p-7">
        <CardHeader
          icon={Server}
          title="Backend & Distributed"
          tag="sys.backend"
          accent="border-azure/30 text-azure"
        />

        {/* Flowing request packets */}
        <div className="relative h-9 overflow-hidden rounded-lg border border-white/[0.06] bg-obsidian/70 px-2">
          <div className="absolute inset-0 flex items-center">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-azure shadow-[0_0_8px_#4FACFE]"
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.24,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-transparent to-obsidian" />
        </div>

        <div className="mt-4 flex items-baseline justify-between font-mono">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {rps.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">req / s</span>
        </div>
        <div className="mt-1 font-mono text-[10px] text-slate-600">
          p50 12ms · p99 68ms · 0 err
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {["Docker", "Kubernetes", "CI/CD", "Microservices", "Linux", "n8n", "LLM Agents"].map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}

/* ─────────────────────────────────────────────────────────────
   3 — FRONTEND & COMMERCE: theme switcher + speed scores
   ───────────────────────────────────────────────────────────── */
const THEMES = [
  { id: "obsidian", label: "Obsidian", scores: { perf: 98, a11y: 100, bp: 100, seo: 100 } },
  { id: "aurora", label: "Aurora", scores: { perf: 92, a11y: 96, bp: 98, seo: 97 } },
  { id: "slate", label: "Slate", scores: { perf: 88, a11y: 94, bp: 95, seo: 93 } },
] as const;
type ThemeId = (typeof THEMES)[number]["id"];

function FrontendCard() {
  const [theme, setTheme] = useState<ThemeId>("obsidian");
  const current = THEMES.find((t) => t.id === theme)!;

  const gauges: Array<{ key: keyof typeof current.scores; label: string }> = [
    { key: "perf", label: "PERF" },
    { key: "a11y", label: "A11Y" },
    { key: "bp", label: "BEST" },
    { key: "seo", label: "SEO" },
  ];

  return (
    <BentoCard variants={cardVariants} className="md:col-span-3">
      <div className="p-6 sm:p-7">
        <CardHeader
          icon={MonitorSmartphone}
          title="Frontend & Custom Commerce"
          tag="ui.systems"
          accent="border-magenta/30 text-magenta"
        />

        <div className="flex items-center gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-mono text-[11px] transition-all",
                theme === t.id
                  ? "border-cyanx/50 bg-cyanx/10 text-cyanx"
                  : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
              )}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] text-slate-600">theme → lighthouse</span>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {gauges.map(({ key, label }) => {
            const score = current.scores[key];
            const R = 20;
            const C = 2 * Math.PI * R;
            const color = score >= 95 ? "#00F5A0" : score >= 90 ? "#00F2FE" : "#FEBC2E";
            return (
              <div key={key} className="flex flex-col items-center gap-1.5">
                <div className="relative h-12 w-12">
                  <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
                    <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                    <motion.circle
                      cx="24" cy="24" r={R} fill="none"
                      stroke={color} strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={C}
                      initial={false}
                      animate={{ strokeDashoffset: C * (1 - score / 100) }}
                      transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold text-white">
                    {score}
                  </span>
                </div>
                <span className="font-mono text-[9px] tracking-[0.15em] text-slate-500">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["React", "Next.js", "TypeScript", "Flutter", "Figma → Code", "Shopify Liquid", "B2B Flows"].map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}

/* ─────────────────────────────────────────────────────────────
   4 — DEVOPS: live container status board
   ───────────────────────────────────────────────────────────── */
type PodStatus = "running" | "syncing" | "idle";
const INITIAL_PODS: Array<{ name: string; status: PodStatus; age: string }> = [
  { name: "api-gateway", status: "running", age: "34d" },
  { name: "auth-svc", status: "running", age: "34d" },
  { name: "inference-0", status: "running", age: "6d" },
  { name: "inference-1", status: "syncing", age: "6d" },
  { name: "worker-nlp", status: "running", age: "12d" },
  { name: "pg-primary", status: "running", age: "34d" },
  { name: "redis-cache", status: "idle", age: "34d" },
  { name: "cdn-edge", status: "running", age: "2d" },
];
const STATUS_STYLE: Record<PodStatus, { dot: string; text: string; label: string }> = {
  running: { dot: "bg-emeraldx shadow-[0_0_6px_#00F5A0]", text: "text-emeraldx", label: "Running" },
  syncing: { dot: "bg-cyanx animate-pulse shadow-[0_0_6px_#00F2FE]", text: "text-cyanx", label: "Syncing" },
  idle: { dot: "bg-slate-500", text: "text-slate-500", label: "Idle" },
};

function DevOpsCard() {
  const [pods, setPods] = useState(INITIAL_PODS);

  useEffect(() => {
    const cycle: PodStatus[] = ["running", "syncing", "idle"];
    const id = setInterval(() => {
      setPods((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * next.length);
        next[i] = { ...next[i], status: cycle[(cycle.indexOf(next[i].status) + 1) % 3] };
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <BentoCard variants={cardVariants} className="md:col-span-3">
      <div className="p-6 sm:p-7">
        <CardHeader
          icon={Boxes}
          title="DevOps, Cloud & Automation"
          tag="ops.cluster"
          accent="border-emeraldx/30 text-emeraldx"
        />

        <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-obsidian/70">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.06] px-4 py-2 font-mono text-[9px] tracking-[0.15em] text-slate-600">
            <span>NAME</span>
            <span>STATUS</span>
            <span>AGE</span>
          </div>
          {pods.map((pod) => {
            const s = STATUS_STYLE[pod.status];
            return (
              <motion.div
                key={pod.name}
                layout
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/[0.03] px-4 py-2 last:border-0"
              >
                <span className="font-mono text-[11px] text-slate-300">{pod.name}</span>
                <span className={cn("flex items-center gap-1.5 font-mono text-[10px]", s.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  {s.label}
                </span>
                <span className="font-mono text-[10px] text-slate-600">{pod.age}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Docker", "Kubernetes", "CI/CD", "Microservices", "Linux"].map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION
   ───────────────────────────────────────────────────────────── */
export default function BentoSkills() {
  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <SectionHeading
        kicker="// 01 — CAPABILITY MATRIX"
        title="Technical Operating System"
        sub="Four engineering planes, one operator. Every domain is production-tested, not portfolio-decorated."
      />
      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 gap-4 md:grid-cols-6"
      >
        <AICard />
        <BackendCard />
        <FrontendCard />
        <DevOpsCard />
      </motion.div>
    </section>
  );
}
