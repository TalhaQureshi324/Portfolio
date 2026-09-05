"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Reveal, SectionHead } from "@/components/ui/primitives";
import { EXPERIENCE } from "@/lib/data";

/**
 * Experience ledger with a scroll-driven progress rail — the
 * accent line fills as the visitor moves through time.
 */
export default function Experience() {
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.75", "end 0.55"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="experience" aria-label="Experience" className="mx-auto max-w-6xl px-6 py-section">
      <SectionHead index="04" title="Experience" aside="2023 — Present" />

      <div ref={railRef} className="relative mt-14 md:pl-10">
        {/* progress rail */}
        <div aria-hidden className="absolute bottom-3 left-0 top-3 hidden w-px bg-line md:block" />
        {!reduce && (
          <motion.div
            aria-hidden
            style={{ scaleY: fill }}
            className="absolute bottom-3 left-0 top-3 hidden w-px origin-top bg-accent md:block"
          />
        )}

        <div className="border-t border-line">
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
      </div>
    </section>
  );
}
