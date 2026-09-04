"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Quiet section reveal — 16px rise + fade, plays once. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Masked line reveal for the hero — text rises out of an
 * overflow-hidden mask. Disabled under reduced motion.
 */
export function MaskedLine({
  children,
  delay = 0,
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: "span" | "div";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[Tag];
  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      <Comp
        initial={reduce ? false : { y: "112%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
        className={`block ${className ?? ""}`}
      >
        {children}
      </Comp>
    </span>
  );
}

/** Simple fade for secondary hero elements (no mask). */
export function HeroFade({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Clip-path unveil for imagery — curtain lifts, slight settle. */
export function ImageUnveil({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { clipPath: "inset(6% 4% 6% 4%)", opacity: 0.6, scale: 1.02 }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Shared section header — mono index + serif title on a hairline. */
export function SectionHead({
  index,
  title,
  aside,
}: {
  index: string;
  title: string;
  aside?: string;
}) {
  return (
    <Reveal>
      <div className="flex items-baseline gap-5 border-t border-line pt-6">
        <span className="label pt-1 text-accent">{index}</span>
        <h2 className="font-serif-display text-3xl text-ink sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
          {title}
        </h2>
        {aside && <span className="label ml-auto hidden pt-1 md:block">{aside}</span>}
      </div>
    </Reveal>
  );
}
