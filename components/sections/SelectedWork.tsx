"use client";

import { Reveal, SectionHead } from "@/components/ui/primitives";
import { PipelineDiagram } from "@/components/ui/PipelineDiagram";
import { FEATURED } from "@/lib/data";

/**
 * Featured case study — large editorial presentation of the
 * malaria screening FYP. Results carry their measurement context;
 * the diagram documents the real pipeline.
 */
export default function SelectedWork() {
  return (
    <section id="work" aria-label="Selected work" className="mx-auto max-w-6xl px-6 py-section">
      <SectionHead index="01" title="Selected work" aside="2023 — 2026" />

      {/* ── Featured case study ── */}
      <Reveal className="mt-16">
        <p className="label text-accent">{FEATURED.eyebrow}</p>
        <h3 className="mt-4 max-w-3xl font-serif-display text-3xl leading-[1.15] text-ink sm:text-4xl md:text-[2.9rem]">
          {FEATURED.title}
        </h3>
        <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2 text-[13px] text-ink2">
          <span>
            <span className="text-ink3">Role — </span>
            {FEATURED.role}
          </span>
          <span>
            <span className="text-ink3">Domain — </span>
            {FEATURED.domain}
          </span>
          <span>
            <span className="text-ink3">Timeline — </span>
            {FEATURED.timeline}
          </span>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Narrative */}
        <div className="space-y-10">
          <Reveal>
            <p className="text-pretty text-[17px] leading-relaxed text-ink2">
              {FEATURED.summary}
            </p>
          </Reveal>

          <Reveal>
            <h4 className="font-serif-display text-xl text-ink">The problem</h4>
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink2">
              {FEATURED.problem}
            </p>
          </Reveal>

          <Reveal>
            <h4 className="font-serif-display text-xl text-ink">The approach</h4>
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink2">
              {FEATURED.approach}
            </p>
          </Reveal>

          <Reveal>
            <h4 className="font-serif-display text-xl text-ink">Built with</h4>
            <p className="mt-3 text-[14px] leading-loose text-ink2">
              {FEATURED.stack.join(" · ")}
            </p>
          </Reveal>
        </div>

        {/* Diagram + results */}
        <div className="flex flex-col gap-10">
          <Reveal delay={0.1}>
            <div className="border border-line bg-paper2/60 p-6">
              <PipelineDiagram
                steps={FEATURED.flow}
                coreIndex={2}
                caption="End-to-end pipeline — the monolayer engine (03) is the project's core contribution."
              />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <h4 className="font-serif-display text-xl text-ink">Results</h4>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {FEATURED.results.map((m) => (
                <div key={m.label} className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 py-5">
                  <dt className="font-serif-display text-4xl text-ink">{m.value}</dt>
                  <dd className="text-[13px] leading-snug text-ink2">
                    {m.label}
                    <span className="block text-ink3">{m.context}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
