"use client";

import { Reveal, SectionHead } from "@/components/ui/primitives";
import { EXPERIENCE } from "@/lib/data";

/** Editorial experience ledger — hairlines and typography, no dashboard. */
export default function Experience() {
  return (
    <section id="experience" aria-label="Experience" className="mx-auto max-w-6xl px-6 py-section">
      <SectionHead index="04" title="Experience" aside="2023 — Present" />

      <div className="mt-14 border-t border-line">
        {EXPERIENCE.map((e, i) => (
          <Reveal key={`${e.org}-${e.role}`} delay={Math.min(i * 0.04, 0.16)}>
            <article className="grid grid-cols-1 gap-y-2 border-b border-line py-8 md:grid-cols-[200px_1fr] md:gap-x-12">
              <p className="label pt-1.5">{e.period}</p>
              <div>
                <h3 className="font-serif-display text-xl text-ink sm:text-[1.35rem]">{e.role}</h3>
                <p className="mt-1 text-[13.5px] text-ink2">
                  {e.org}
                  {e.location ? ` — ${e.location}` : ""}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {e.points.map((pt) => (
                    <li key={pt} className="text-pretty text-[14.5px] leading-relaxed text-ink2">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
