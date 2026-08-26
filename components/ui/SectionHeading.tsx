"use client";

import Reveal from "./Reveal";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  sub?: string;
}

/** Section header — mono kicker / display title / slate sub-copy */
export default function SectionHeading({ kicker, title, sub }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-4 font-mono text-xs tracking-[0.25em] text-cyanx/90">
        {kicker}
      </p>
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-slate-400">
          {sub}
        </p>
      )}
      <div className="hairline-flow mx-auto mt-8 w-40" />
    </Reveal>
  );
}
