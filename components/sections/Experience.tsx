"use client";

import { motion, type Variants } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { TIMELINE, type TimelineEntry } from "@/lib/data";
import { cn } from "@/lib/utils";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const entryVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const TYPE_STYLE: Record<TimelineEntry["type"], { badge: string; dot: string; glow: string }> = {
  FOUNDER: {
    badge: "border-emeraldx/30 bg-emeraldx/[0.08] text-emeraldx",
    dot: "bg-emeraldx shadow-[0_0_10px_#00F5A0]",
    glow: "from-emeraldx/60",
  },
  INDUSTRY: {
    badge: "border-cyanx/30 bg-cyanx/[0.08] text-cyanx",
    dot: "bg-cyanx shadow-[0_0_10px_#00F2FE]",
    glow: "from-cyanx/60",
  },
  MENTOR: {
    badge: "border-violetx/40 bg-violetx/[0.08] text-[#B879FF]",
    dot: "bg-violetx shadow-[0_0_10px_#7F00FF]",
    glow: "from-violetx/60",
  },
  ACADEMIC: {
    badge: "border-violetx/30 bg-violetx/[0.08] text-magenta",
    dot: "bg-magenta shadow-[0_0_10px_#E100FF]",
    glow: "from-magenta/60",
  },
  EDUCATION: {
    badge: "border-azure/30 bg-azure/[0.08] text-azure",
    dot: "bg-azure shadow-[0_0_10px_#4FACFE]",
    glow: "from-azure/60",
  },
};

function TimelineItem({ entry, last }: { entry: TimelineEntry; last: boolean }) {
  const style = TYPE_STYLE[entry.type];
  return (
    <motion.li variants={entryVariants} className="relative pl-10 sm:pl-14">
      {/* Glowing milestone dot */}
      <span className="absolute left-0 top-1.5">
        <span className={cn("block h-3 w-3 rounded-full", style.dot)} />
        <span
          aria-hidden
          className={cn("absolute inset-0 animate-ping rounded-full opacity-30 bg-gradient-to-r to-transparent", style.glow)}
        />
      </span>

      {/* Connector */}
      {!last && (
        <span
          aria-hidden
          className="absolute left-[5.5px] top-6 h-[calc(100%-14px)] w-px bg-gradient-to-b from-white/20 via-white/[0.06] to-transparent"
        />
      )}

      <div className="group rounded-2xl border border-white/[0.06] bg-surface/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:bg-surface/70 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs tracking-[0.12em] text-slate-400">{entry.period}</span>
          <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[9px] tracking-[0.15em]", style.badge)}>
            {entry.type}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{entry.role}</h3>
        <p className={cn("mt-0.5 font-mono text-xs", "text-slate-500")}>{entry.org}</p>

        <ul className="mt-4 space-y-2">
          {entry.points.map((point) => (
            <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-slate-400">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-white/[0.07] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] text-slate-500 transition-colors group-hover:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.li>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-4xl px-6 py-16 md:py-20">
      <SectionHeading
        kicker="// 04 — TRAJECTORY"
        title="Experience & Milestones"
        sub="Industry engineering runs, lecture halls, and founder sessions — the full log."
      />
      <motion.ol
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="space-y-8"
      >
        {TIMELINE.map((entry, i) => (
          <TimelineItem key={`${entry.period}-${entry.role}`} entry={entry} last={i === TIMELINE.length - 1} />
        ))}
      </motion.ol>
    </section>
  );
}
