"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import MetricsBadge from "@/components/ui/MetricsBadge";

const FACTS = [
  { k: "LOCATION", v: "Pakistan · PKT (UTC+5)" },
  { k: "FOCUS", v: "Edge AI · NLP · Automation" },
  { k: "STATUS", v: "Open to opportunities", accent: true },
];

/**
 * Compact operator profile — short, metrics-driven bio.
 * (A brief technical About section is still standard on
 * senior portfolios; what's outdated is the long essay.)
 */
export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <SectionHeading
        kicker="// 00 — OPERATOR PROFILE"
        title="About"
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <div className="glass h-full rounded-2xl p-7 sm:p-9">
            <p className="text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              I&apos;m{" "}
              <span className="font-semibold text-white">Muhammad Talha Qureshi</span>{" "}
              — an AI systems engineer who takes models out of notebooks and
              bolts them onto real hardware and real traffic.
            </p>
            <p className="mt-4 text-pretty text-base leading-relaxed text-slate-400">
              My work spans biomedical computer vision — a microscope-integrated
              malaria screening engine — LLM-driven automation that ships
              thousands of tailored audits a week, and headless commerce
              platforms built for conversion. Currently engineering AI
              automation and FastAPI services at{" "}
              <span className="text-cyanx">Intellimind</span>, speaking and
              mentoring at <span className="text-cyanx">Dev Weekends</span>,
              and closing out a BS in Computer Science with an AI
              concentration.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["EDGE AI", "BIOMEDICAL CV", "LLM AGENTS", "NLP", "AUTOMATION", "HEADLESS COMMERCE"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-slate-400 transition-colors hover:border-cyanx/40 hover:text-cyanx"
                >
                  {chip}
                </span>
              ))}
            </div>

            <p className="mt-8 font-mono text-xs text-slate-600">
              <span className="text-cyanx">$</span> whoami → t.qureshi · builder of systems that ship
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex h-full flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <MetricsBadge value="50+" label="Developers mentored" className="glass rounded-2xl p-5" />
              <MetricsBadge value="120+" label="Students TA'd" className="glass rounded-2xl p-5" />
              <MetricsBadge value="5,000+" label="Audits / week" className="glass rounded-2xl p-5" />
              <MetricsBadge value="6" label="Flagship systems" className="glass rounded-2xl p-5" />
            </div>

            <div className="glass mt-auto space-y-2.5 rounded-2xl p-5">
              {FACTS.map((f) => (
                <p key={f.k} className="flex items-center justify-between font-mono text-xs">
                  <span className="tracking-[0.15em] text-slate-600">{f.k}</span>
                  <span className={f.accent ? "text-emeraldx" : "text-slate-300"}>{f.v}</span>
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
