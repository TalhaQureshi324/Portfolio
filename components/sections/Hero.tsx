"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { MaskedLine, HeroFade } from "@/components/ui/primitives";
import { scrollToSection } from "@/lib/utils";
import portrait from "../../public/profile_new.png";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hero — layered cinematic portrait composition.
 *
 * Layers (back → front): ghost name (drifts slowest) → portrait panel
 * (masked curtain entrance, tonal treatment, pointer parallax) → copy
 * column (masked line entrance) → scroll cue.
 *
 * Scroll: the whole composition recedes at three different rates, so
 * leaving the hero reads as depth, not disappearance.
 */
export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // ── pointer parallax (desktop, fine pointer only) ──
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 55, damping: 18 });
  const spy = useSpring(py, { stiffness: 55, damping: 18 });
  const portraitX = useTransform(spx, (v) => v * 12);
  const portraitY = useTransform(spy, (v) => v * 9);
  const ghostX = useTransform(spx, (v) => v * -6);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onMouseLeave() {
    px.set(0);
    py.set(0);
  }

  // ── scroll choreography ──
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.1]);
  const portraitScrollY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const ghostScrollY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden"
    >
      {/* ── Layer 0: oversized ghost name (behind portrait) ──
          SVG wordmark: textLength locks "TALHA QURESHI" to exactly
          the container width, so the full name is always visible and
          scales proportionally at every viewport size — no clipping. */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: ghostScrollY, x: ghostX }}
        className="pointer-events-none absolute inset-x-0 top-[11%] z-0 hidden select-none lg:block"
      >
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
          className="block text-ink/[0.055]"
        >
          <svg viewBox="0 0 1200 122" className="block h-auto w-full" role="presentation" focusable="false">
            <text
              x="600"
              y="96"
              textAnchor="middle"
              textLength="1170"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="var(--font-fraunces), Georgia, serif"
              fontWeight={500}
              fontSize="104"
              style={{ fontVariationSettings: '"opsz" 72' }}
              fill="currentColor"
            >
              TALHA QURESHI
            </text>
          </svg>
        </motion.span>
      </motion.div>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-end gap-14 px-6 pt-32 md:pt-40 lg:min-h-[92vh] lg:grid-cols-[1fr_0.92fr] lg:gap-10 lg:pt-36">
        {/* ── Layer 2: copy column (recedes on scroll) ── */}
        <motion.div
          style={reduce ? undefined : { scale: copyScale, y: copyY, opacity: copyOpacity }}
          className="relative z-20 lg:pb-24"
        >
          <MaskedLine delay={0.1}>
            <span className="label text-accent">Muhammad Talha Qureshi</span>
          </MaskedLine>

          <h1 className="mt-6 font-serif-display text-[3rem] leading-[1.02] text-ink sm:text-6xl lg:text-[4.6rem] xl:text-[5rem]">
            <MaskedLine delay={0.22}>AI/ML engineer</MaskedLine>
            <MaskedLine delay={0.34}>
              <span className="text-ink">&amp; full-stack</span>
            </MaskedLine>
            <MaskedLine delay={0.46}>
              <span className="text-ink">developer.</span>
            </MaskedLine>
          </h1>

          <HeroFade delay={0.6}>
            <p className="mt-8 max-w-md text-pretty text-[17px] leading-relaxed text-ink2">
              I build AI-powered products end to end — from a
              microscope-integrated malaria screening system to automation
              pipelines and the web applications that deliver them.
            </p>
          </HeroFade>

          <HeroFade delay={0.75}>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button
                onClick={() => scrollToSection("work")}
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors duration-300 hover:bg-accentdeep"
              >
                View selected work
                <ArrowDown size={15} className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </button>
              <a href="/Resume.pdf" download className="link-quiet text-sm text-ink">
                Resume
              </a>
              <button onClick={() => scrollToSection("contact")} className="link-quiet text-sm text-ink">
                Get in touch
              </button>
            </div>
          </HeroFade>

          <HeroFade delay={0.9}>
            <p className="mt-12 flex items-center gap-2.5 text-[13px] text-ink2">
              <span className="inline-block h-[5px] w-[5px] rounded-full bg-accent" aria-hidden />
              Available for new opportunities — Pakistan (UTC+5)
            </p>
          </HeroFade>
        </motion.div>

        {/* ── Layer 1: the portrait panel ── */}
        <motion.div
          style={reduce ? undefined : { y: portraitScrollY }}
          className="relative mx-auto w-full max-w-[420px] self-end lg:max-w-none"
        >
          {/* vertical edge label */}
          <span
            aria-hidden
            className="absolute -left-12 top-1/4 hidden origin-top-left -rotate-90 font-mono text-[10px] tracking-[0.32em] text-ink3 xl:block"
          >
            MUHAMMAD TALHA QURESHI — PKT
          </span>

          {/* offset accent frame */}
          <div
            aria-hidden
            className="absolute -right-4 -top-4 hidden h-full w-full border border-accent/70 sm:block lg:-right-5 lg:-top-5"
          />

          {/* curtain entrance + pointer parallax */}
          <motion.div
            initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)", scale: 1.07 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
            transition={{ duration: 1.35, delay: 0.4, ease: EASE }}
            className="img-quiet relative"
          >
            <motion.figure
              style={reduce ? undefined : { x: portraitX, y: portraitY, scale: portraitScale }}
              className="relative aspect-[3/4] w-full overflow-hidden lg:aspect-auto lg:h-[74vh] lg:min-h-[560px]"
            >
              <Image
                src={portrait}
                alt="Portrait of Muhammad Talha Qureshi"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 46vw"
                className="object-cover object-[50%_16%] saturate-[0.82] contrast-[1.05]"
              />
              {/* tonal treatment: vignette + bottom blend into the page */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_22%,transparent_55%,rgba(26,25,21,0.20))]"
              />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/30 to-transparent" />
              {/* in-photo caption */}
              <p className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.18em] text-paper/85">
                FINAL-YEAR CS · AI CONCENTRATION
              </p>
            </motion.figure>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll cue ── */}
      <HeroFade delay={1.4}>
        <motion.div
          style={reduce ? undefined : { opacity: cueOpacity }}
          className="pointer-events-none absolute bottom-8 left-6 hidden items-center gap-3 md:flex lg:left-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          <motion.span
            aria-hidden
            animate={reduce ? undefined : { scaleY: [1, 0.4, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="block h-9 w-px origin-top bg-ink/40"
          />
          <span className="label">Scroll</span>
        </motion.div>
      </HeroFade>
    </section>
  );
}
