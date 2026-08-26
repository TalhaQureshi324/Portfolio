"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import MetricsBadge from "@/components/ui/MetricsBadge";
import LazyParticleField from "@/components/3d/LazyParticleField";
import { openTerminal, scrollToSection } from "@/lib/utils";
import { SOCIALS } from "@/lib/data";
import profilePic from "../../public/profile.png";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
      {/* ── Layered background: WebGL field + mesh glows + grid ── */}
      <LazyParticleField />
      <div aria-hidden className="grid-bg absolute inset-0" />
      <div
        aria-hidden
        className="aurora absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-cyanx/[0.07] blur-[130px]"
      />
      <div
        aria-hidden
        className="aurora-reverse absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-violetx/[0.09] blur-[130px]"
      />
      {/* Fade into page background */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-obsidian"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-16 pt-32 lg:grid-cols-[1.12fr_0.88fr] lg:pt-28"
      >
        {/* ── Left: copy + CTAs + metrics ── */}
        <div>
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-surface/70 px-4 py-1.5 backdrop-blur-xl"
          >
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emeraldx" />
            <span className="font-mono text-xs tracking-wide text-slate-300">
              <span className="text-cyanx">&gt;</span> AI Systems Engineer &amp; Full-Stack Architect
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.6rem]"
          >
            Engineering Scalable{" "}
            <span className="text-gradient-mixed">AI Pipelines</span> &amp;
            Production-Grade{" "}
            <span className="text-gradient-cyan">Full-Stack Applications</span>.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            End-to-end expertise across deep learning architectures — computer
            vision, NLP, explainable AI — distributed backends, and
            high-conversion frontends. From research notebook to
            production traffic.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton
              onClick={() => scrollToSection("projects")}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyanx to-azure px-6 py-3 text-sm font-semibold text-obsidian shadow-glow-cyan transition-shadow hover:shadow-[0_0_50px_-8px_rgba(0,242,254,0.7)]"
            >
              Explore Systems
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton
              onClick={openTerminal}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3 font-mono text-sm text-slate-200 transition-colors hover:border-cyanx/40 hover:text-cyanx"
            >
              <span className="text-cyanx">$</span> Open CLI Terminal
            </MagneticButton>
          </motion.div>

          {/* Quick KPI strip */}
          <motion.div
            variants={item}
            className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-white/[0.08]"
          >
            <MetricsBadge value="98.4%" label="Model accuracy" className="pl-0 pr-4" />
            <MetricsBadge value="<45ms" label="Inference latency" className="px-4" />
            <MetricsBadge value="+120%" label="System throughput" className="pl-4" />
          </motion.div>

          <motion.div variants={item} className="mt-9 flex items-center gap-2">
            {[
              { href: SOCIALS.github, Icon: Github, label: "GitHub" },
              { href: SOCIALS.linkedin, Icon: Linkedin, label: "LinkedIn" },
              { href: SOCIALS.email, Icon: Mail, label: "Email" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="rounded-lg border border-white/[0.08] p-2.5 text-slate-500 transition-all hover:border-cyanx/40 hover:text-cyanx"
              >
                <Icon size={16} />
              </a>
            ))}
          </motion.div>
        </div>

        {/* ── Right: operator portrait card ── */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.97 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          {/* Ambient glow */}
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-cyanx/15 via-transparent to-violetx/20 blur-2xl"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl"
          >
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5">
              <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500">
                OPERATOR // T.QURESHI
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-emeraldx">
                <span className="h-1 w-1 animate-pulse-dot rounded-full bg-emeraldx" />
                ONLINE
              </span>
            </div>

            {/* Portrait */}
            <div className="relative aspect-[4/5]">
              <Image
                src={profilePic}
                alt="Talha Qureshi — AI Systems Engineer"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover object-top"
              />
              {/* Scanline sweep */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-24 animate-scanline bg-gradient-to-b from-transparent via-cyanx/[0.07] to-transparent"
              />
              {/* Bottom readout */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/95 via-obsidian/60 to-transparent p-4 pt-10">
                <p className="font-mono text-[11px] leading-relaxed text-slate-300">
                  <span className="text-cyanx">ROLE</span> — AI/ML Systems Engineer
                  <br />
                  <span className="text-magenta">BASE</span> — Pakistan · PKT (UTC+5)
                  <br />
                  <span className="text-emeraldx">MODE</span> — Shipping to production
                </p>
              </div>
            </div>
          </motion.div>

          {/* Corner brackets */}
          <span aria-hidden className="absolute -left-2 -top-2 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-cyanx/60" />
          <span aria-hidden className="absolute -right-2 -top-2 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-cyanx/60" />
          <span aria-hidden className="absolute -bottom-2 -left-2 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-violetx/60" />
          <span aria-hidden className="absolute -bottom-2 -right-2 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-violetx/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
