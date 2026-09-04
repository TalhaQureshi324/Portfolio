"use client";

import { Reveal, SectionHead } from "@/components/ui/primitives";
import { EXPERTISE } from "@/lib/data";

/** Restrained expertise matrix — categorized, typographic, credible. */
export default function Expertise() {
  return (
    <section id="expertise" aria-label="Technical expertise" className="border-t border-line bg-paper2/50">
      <div className="mx-auto max-w-6xl px-6 py-section">
        <SectionHead index="04" title="Technical expertise" />

        <div className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {EXPERTISE.map((group, i) => (
            <Reveal key={group.category} delay={Math.min(i * 0.05, 0.2)}>
              <div className="border-t border-ink/70 pt-4">
                <h3 className="label text-accent">{group.category}</h3>
                <p className="mt-3 text-[15px] leading-loose text-ink2">
                  {group.items.join(" · ")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
