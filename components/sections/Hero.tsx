"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { MaskedLine, HeroFade, ImageUnveil } from "@/components/ui/primitives";
import { scrollToSection } from "@/lib/utils";
import portrait from "../../public/profile.png";

/**
 * Editorial hero — typography-led, single accent, choreographed
 * masked-line entrance. No particles, no glow, no counters.
 */
export default function Hero() {
  return (
    <section id="top" className="relative">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-36 md:pt-44 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        {/* ── Copy ── */}
        <div>
          <MaskedLine delay={0.1}>
            <span className="label text-accent">Muhammad Talha Qureshi</span>
          </MaskedLine>

          <h1 className="mt-6 font-serif-display text-[2.9rem] leading-[1.04] text-ink sm:text-6xl lg:text-[4.4rem]">
            <MaskedLine delay={0.22}>AI/ML engineer</MaskedLine>
            <MaskedLine delay={0.34}>&amp; full-stack developer.</MaskedLine>
          </h1>

          <HeroFade delay={0.55}>
            <p className="mt-8 max-w-md text-pretty text-[17px] leading-relaxed text-ink2">
              I build AI-powered products end to end — from a
              microscope-integrated malaria screening system to automation
              pipelines and the web applications that deliver them.
            </p>
          </HeroFade>

          <HeroFade delay={0.7}>
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

          <HeroFade delay={0.85}>
            <p className="mt-12 flex items-center gap-2.5 text-[13px] text-ink2">
              <span className="inline-block h-[5px] w-[5px] rounded-full bg-accent" aria-hidden />
              Available for new opportunities — Pakistan (UTC+5)
            </p>
          </HeroFade>
        </div>

        {/* ── Portrait with offset accent frame ── */}
        <HeroFade delay={0.45} className="relative mx-auto w-full max-w-[340px] lg:max-w-[400px]">
          <div aria-hidden className="absolute -right-4 -top-4 hidden h-full w-full border border-accent sm:block" />
          <ImageUnveil delay={0.6} className="relative">
            <figure className="img-quiet relative aspect-[4/5]">
              <Image
                src={portrait}
                alt="Portrait of Muhammad Talha Qureshi"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 400px"
                className="object-cover object-top"
              />
            </figure>
          </ImageUnveil>
          <HeroFade delay={1.0}>
            <p className="mt-4 flex items-center justify-between text-[13px] text-ink2">
              <span>Final-year CS · AI concentration</span>
              <ArrowUpRight size={14} aria-hidden />
            </p>
          </HeroFade>
        </HeroFade>
      </div>
    </section>
  );
}
