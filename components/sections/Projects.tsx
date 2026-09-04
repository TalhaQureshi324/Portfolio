"use client";

import { Reveal } from "@/components/ui/primitives";
import { PipelineDiagram } from "@/components/ui/PipelineDiagram";
import { PROJECTS } from "@/lib/data";

/**
 * Selected projects — editorial index rows on hairlines, then the
 * automation system's real workflow diagram. No cards, no hover
 * theatrics: the type does the work.
 */
export default function Projects() {
  return (
    <section aria-label="Other projects" className="mx-auto max-w-6xl px-6 pb-section">
      {/* ── Project index ── */}
      <div className="border-t border-line">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.04, 0.16)}>
            <article className="group grid grid-cols-[auto_1fr] gap-x-6 border-b border-line py-9 transition-colors duration-300 hover:bg-paper2/70 sm:gap-x-10 md:grid-cols-[64px_1fr_auto] md:py-10">
              <span className="label pt-2">{p.index}</span>

              <div className="max-w-2xl">
                <h3 className="font-serif-display text-[1.45rem] leading-snug text-ink sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] text-ink2">
                  {p.role} · {p.year}
                </p>
                <p className="mt-3 text-pretty text-[14.5px] leading-relaxed text-ink2">
                  {p.description}
                </p>
                <p className="mt-4 text-[12.5px] leading-relaxed text-ink2">
                  {p.stack.join(" · ")}
                </p>
                {p.metrics && (
                  <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                    {p.metrics.map((m) => (
                      <div key={m.label} className="flex items-baseline gap-3">
                        <dt className="font-serif-display text-2xl text-ink">{m.value}</dt>
                        <dd className="max-w-[220px] text-[11.5px] leading-snug text-ink2">
                          {m.label} — {m.context}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* ── Automation workflow diagram (real system) ── */}
      <Reveal className="mt-20">
        <div className="border border-line bg-paper2/60 p-6 sm:p-10">
          <p className="label mb-8">
            Project 02 — how the outbound pipeline actually works
          </p>
          <PipelineDiagram
            steps={["Lead scraping", "Site audit", "LLM outreach", "Instantly dispatch", "Reply webhooks"]}
            coreIndex={2}
            caption="Self-hosted n8n orchestration — every stage is code-driven; no step is manual."
          />
        </div>
      </Reveal>

      <Reveal className="mt-12">
        <p className="text-[14px] text-ink2">
          Detailed write-ups, benchmarks and code walkthroughs for any project
          here are available on request — or{" "}
          <a
            href="https://github.com/TalhaQureshi324"
            target="_blank"
            rel="noreferrer"
            className="link-accent"
          >
            browse my GitHub
          </a>
          .
        </p>
      </Reveal>
    </section>
  );
}
