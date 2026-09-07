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
import { MaskedLine, HeroFade, ImageUnveil } from "@/components/ui/primitives";
import MagneticButton from "@/components/ui/MagneticButton";
import { scrollToSection } from "@/lib/utils";
import portrait from "../../public/profile_new.png";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hero — layered cinematic portrait composition.
 *
 * Vertical balance: the copy column is bottom-anchored with a
 * viewport-relative inset (lg:pb-[10vh]) so its center of mass
 * aligns with the portrait's optical center, not its top edge.
 * On xl the headline extends past its column onto the portrait's
 * gray backdrop — controlled overlap, never over the face.
 *
 * Scroll: three layers recede at different rates, and the in-photo
 * caption hands off from identity to the first case study, so the
 * portrait leads the visitor into the malaria project.
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
  // caption handoff: identity fades out, first case study fades in
  const capIdentity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const capCase = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden"
    >
      {/* ── Layer 0: oversized ghost wordmark (SVG — always complete) ── */}
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

      {/* ── Composition grid ──
          Mobile: single column with deliberate interleaving —
          identity → headline → PORTRAIT → description → CTAs.
          Desktop: two columns, copy bottom-weighted against the
          portrait's optical center. */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 pt-32 md:pt-36 lg:min-h-screen lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-end lg:gap-10 lg:pt-44">
        {/* ── Left column: copy (recedes on scroll) ──
            [display:contents] on mobile lets its children interleave
            with the portrait via order; block restores transforms on lg. */}
        <motion.div
          style={reduce ? undefined : { scale: copyScale, y: copyY, opacity: copyOpacity }}
          className="relative z-20 [display:contents] lg:[display:block] lg:self-end lg:pb-[7vh]"
        >
          <HeroFade delay={0.05} className="order-1">
            <p className="font-mono text-[11px] uppercase leading-none tracking-[0.26em] text-ink2">
              Muhammad Talha Qureshi
            </p>
          </HeroFade>

          <h1 className="order-2 mt-7 font-serif-display text-[2.9rem] leading-[1.05] text-ink sm:text-6xl lg:mt-8 lg:text-[4.4rem] xl:text-[4.65rem]">
            <MaskedLine delay={0.18}>AI/ML</MaskedLine>
            <MaskedLine delay={0.3}>engineer</MaskedLine>
            <MaskedLine delay={0.42}>&amp; full-stack</MaskedLine>
            <MaskedLine delay={0.54}>developer.</MaskedLine>
          </h1>

          <HeroFade delay={0.62} className="order-4 mt-9 lg:mt-10">
            <p className="max-w-md text-pretty text-[17px] leading-relaxed text-ink2">
              I build AI-powered products end to end — from a
              microscope-integrated malaria screening system to automation
              pipelines and the web applications that deliver them.
            </p>
          </HeroFade>

          <HeroFade delay={0.72} className="order-5 mt-10">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <MagneticButton
                onClick={() => scrollToSection("work")}
                strength={0.18}
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors duration-300 hover:bg-accentdeep"
              >
                View selected work
                <ArrowDown size={15} className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </MagneticButton>
              <a href="/Resume.pdf" download className="link-quiet text-sm text-ink">
                Resume
              </a>
              <button onClick={() => scrollToSection("contact")} className="link-quiet text-sm text-ink">
                Get in touch
              </button>
            </div>
          </HeroFade>

          <HeroFade delay={0.85} className="order-6 mt-12">
            <p className="flex items-center gap-2.5 text-[13px] text-ink2">
              <span className="inline-block h-[5px] w-[5px] rounded-full bg-accent" aria-hidden />
              Available for new opportunities — Pakistan (UTC+5)
            </p>
          </HeroFade>
        </motion.div>

        {/* ── Right: the portrait panel (larger, bottom-anchored) ── */}
        <motion.div
          style={reduce ? undefined : { y: portraitScrollY }}
          className="relative order-3 mx-auto mt-12 w-full max-w-[440px] self-end lg:order-none lg:mb-[50px] lg:mt-0 lg:max-w-none"
        >
          {/* vertical identity label — rotated, on the portrait's left edge */}
          <span
            aria-hidden
            className="absolute -left-12 top-1/4 hidden origin-top-left -rotate-90 font-mono text-[10px] tracking-[0.32em] text-ink3 lg:block"
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
            transition={{ duration: 1.3, delay: 0.3, ease: EASE }}
            className="img-quiet relative"
          >
            <motion.figure
              style={reduce ? undefined : { x: portraitX, y: portraitY, scale: portraitScale }}
              className="relative aspect-[3/4] w-full overflow-hidden lg:aspect-auto lg:h-[74vh] lg:min-h-[560px] [@media(max-height:820px)]:lg:h-[82vh]"
            >
              <Image
                src={portrait}
                alt="Portrait of Muhammad Talha Qureshi"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 48vw"
                className="object-cover object-[50%_14%] saturate-[0.82] contrast-[1.05]"
              />
              {/* tonal treatment: vignette + bottom blend into the page */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_22%,transparent_55%,rgba(26,25,21,0.20))]"
              />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/30 to-transparent" />

              {/* scroll handoff: identity caption → first case study */}
              <div className="absolute bottom-4 left-4 right-4">
                <motion.p
                  aria-hidden={reduce ? undefined : true}
                  style={reduce ? undefined : { opacity: capIdentity }}
                  className="font-mono text-[10px] tracking-[0.18em] text-paper/85"
                >
                  FINAL-YEAR CS · AI CONCENTRATION
                </motion.p>
                {!reduce && (
                  <motion.p
                    style={{ opacity: capCase }}
                    className="absolute bottom-0 left-0 right-0 font-mono text-[10px] tracking-[0.18em] text-paper"
                  >
                    NEXT — CASE FILE 01 · MALARIA SCREENING ↓
                  </motion.p>
                )}
              </div>
            </motion.figure>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll cue ── */}
      <HeroFade delay={1.1}>
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
