"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import MetricsBadge from "@/components/ui/MetricsBadge";
import { PROJECTS, type Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import MalariaViz from "./MalariaViz";
import AutomationViz from "./AutomationViz";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const ACCENTS = {
  cyan: {
    text: "text-cyanx",
    border: "hover:border-cyanx/35",
    glow: "from-cyanx/[0.12]",
    chip: "border-cyanx/30 text-cyanx",
    flow: "#00F2FE",
  },
  violet: {
    text: "text-magenta",
    border: "hover:border-magenta/35",
    glow: "from-violetx/[0.12]",
    flow: "#7F00FF",
  },
  emerald: {
    text: "text-emeraldx",
    border: "hover:border-emeraldx/35",
    glow: "from-emeraldx/[0.10]",
    chip: "border-emeraldx/30 text-emeraldx",
    flow: "#00F5A0",
  },
  mixed: {
    text: "text-gradient-cyan",
    border: "hover:border-cyanx/35",
    glow: "from-azure/[0.12]",
    chip: "border-cyanx/30 text-cyanx",
    flow: "#4FACFE",
  },
} as const;

/** Animated end-to-end data flow diagram */
function FlowDiagram({ steps, color }: { steps: string[]; color: string }) {
  return (
    <div className="flex flex-wrap items-center gap-y-3">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.09, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "rounded-lg border bg-surface px-3 py-2 font-mono text-[10px] tracking-wider sm:text-[11px]",
              i === 0
                ? "border-emeraldx/40 text-emeraldx"
                : i === steps.length - 1
                  ? "border-cyanx/40 text-cyanx"
                  : "border-white/10 text-slate-300"
            )}
          >
            {step}
          </motion.div>
          {i < steps.length - 1 && (
            <div className="flow-track mx-1" style={{ "--flow-color": color } as React.CSSProperties} />
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const accent = ACCENTS[project.accent];

  return (
    <motion.article
      id={project.id}
      variants={itemVariants}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/50 backdrop-blur-xl transition-all duration-300",
        accent.border
      )}
    >
      {/* Accent wash on hover */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          accent.glow
        )}
      />

      <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        {/* ── Narrative column ── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className={cn("font-mono text-4xl font-bold tracking-tighter opacity-90", accent.text)}>
              {project.num}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={project.demo}
                className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyanx/40 hover:text-cyanx"
              >
                Live <ArrowUpRight size={12} />
              </a>
              <a
                href={project.repo}
                className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyanx/40 hover:text-cyanx"
              >
                <Github size={12} /> Repo
              </a>
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {project.platform}
          </p>
          {project.role && (
            <p className="mt-1 font-mono text-[10px] tracking-wide text-cyanx/80">{project.role}</p>
          )}
          <h3 className="mt-2 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{project.tagline}</p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.2em] text-rose-400/90">
                ▲ THE ENGINEERING PROBLEM
              </p>
              <p className="text-sm leading-relaxed text-slate-400">{project.problem}</p>
            </div>
            <div>
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.2em] text-emeraldx/90">
                ✓ THE SOLUTION
              </p>
              <p className="text-sm leading-relaxed text-slate-400">{project.solution}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] text-slate-500"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* ── Systems column: diagram + metrics ── */}
        <div className="flex flex-col gap-6">
          {project.viz === "malaria" ? (
            <MalariaViz />
          ) : project.viz === "automation" ? (
            <AutomationViz />
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-obsidian/60 p-5">
              <p className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-slate-500">
                <span className={cn("h-1.5 w-1.5 rounded-full", "bg-current", accent.text)} />
                SYSTEM TOPOLOGY — END-TO-END DATA FLOW
              </p>
              <FlowDiagram steps={project.flow} color={accent.flow} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 rounded-xl border border-white/[0.06] bg-obsidian/60 p-5">
            {project.metrics.map((m) => (
              <MetricsBadge
                key={m.label}
                value={m.value}
                label={m.label}
                valueClassName={
                  project.viz
                    ? "text-cyanx drop-shadow-[0_0_14px_rgba(0,242,254,0.4)]"
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function CaseStudies() {
  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <SectionHeading
        kicker="// 02 — FLAGSHIP SYSTEMS"
        title="Featured Case Studies"
        sub="Engineering post-mortems in public: the hurdle, the architecture, and the measured impact."
      />
      <motion.div
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="space-y-6"
      >
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>

      <Reveal className="mt-10 text-center">
        <p className="font-mono text-xs text-slate-500">
          <span className="text-cyanx">$</span> ls ~/archive --all &nbsp;·&nbsp; more systems
          available on request
        </p>
      </Reveal>
    </section>
  );
}
