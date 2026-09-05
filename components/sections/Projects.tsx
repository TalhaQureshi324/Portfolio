"use client";

import { Reveal } from "@/components/ui/primitives";
import { PROJECTS } from "@/lib/data";

/**
 * Selected projects — editorial index rows. Each row carries
 * data-project so the tech map can light it up on interaction.
 */
export default function Projects() {
  return (
    <section aria-label="Other projects" className="mx-auto max-w-6xl px-6 pb-section">
      {/* ── Project index ── */}
      <div className="border-t border-line">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.04, 0.16)}>
            <article
              data-project={p.id}
              className="group grid grid-cols-[auto_1fr] gap-x-6 border-b border-line py-9 transition-colors duration-300 hover:bg-paper2/70 sm:gap-x-10 md:grid-cols-[64px_1fr] md:py-10"
            >
              <span className="label pt-2 transition-colors duration-300 group-hover:text-accent">
                {p.index}
              </span>

              <div className="max-w-2xl">
                <h3 className="font-serif-display text-[1.45rem] leading-snug text-ink transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-2xl">
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

      {/* ── Pointer to the interactive explorer ── */}
      <Reveal className="mt-14">
        <p className="text-[14px] text-ink2">
          Want to see how these systems actually work?{" "}
          <button
            onClick={() => {
              document.getElementById("systems")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="link-accent"
          >
            Explore the architectures
          </button>{" "}
          — or{" "}
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
