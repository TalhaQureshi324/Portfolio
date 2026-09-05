"use client";

import { Reveal, SectionHead } from "@/components/ui/primitives";

const FACTS = [
  { k: "Based in", v: "Pakistan — working remotely (UTC+5)" },
  { k: "Currently", v: "AI Automation & Full-Stack Developer, Intellimind" },
  { k: "Education", v: "BS Computer Science, AI concentration — final year" },
  { k: "Focus", v: "Computer vision · NLP · practical automation" },
];

export default function About() {
  return (
    <section id="about" aria-label="About" className="border-t border-line bg-paper2/50">
      <div className="mx-auto max-w-6xl px-6 py-section">
        <SectionHead index="03" title="About" />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <div className="space-y-6 text-pretty text-[17px] leading-relaxed text-ink2">
              <p>
                I&apos;m Talha — a final-year computer science student and
                working engineer based in Pakistan. I came into machine
                learning through computer vision, and I like the whole path a
                product takes: the model, the API around it, and the interface
                people actually touch.
              </p>
              <p>
                Most of my time goes into applied AI at Intellimind — NLP
                assistants and workflow automation — and into my final-year
                project, a microscope-integrated malaria screening tool. On
                weekends I mentor developers at Dev Weekends.
              </p>
              <p>
                I care about software that is calm, readable, and honest about
                what it can do. The projects on this site are measured that
                way — including what didn&apos;t work.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="divide-y divide-line border-y border-line">
              {FACTS.map((f) => (
                <div key={f.k} className="grid grid-cols-[130px_1fr] gap-4 py-5 sm:grid-cols-[160px_1fr]">
                  <dt className="label pt-1">{f.k}</dt>
                  <dd className="text-[14.5px] leading-relaxed text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
