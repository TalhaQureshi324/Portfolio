"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { SectionHead, Reveal } from "@/components/ui/primitives";
import { SYSTEMS } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Interactive architecture explorer — pick a system, watch its
 * pipeline assemble, click any stage to read what was actually
 * built there. Everything documents real systems; nothing simulates.
 */
export default function SystemsExplorer() {
  const reduce = useReducedMotion();
  const pipelineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(pipelineRef, { once: true, margin: "-20% 0px" });

  const [sysId, setSysId] = useState(SYSTEMS[0].id);
  const sys = SYSTEMS.find((s) => s.id === sysId)!;
  const [activeNodeId, setActiveNodeId] = useState(
    sys.nodes.find((n) => n.core)?.id ?? sys.nodes[0].id
  );
  const node = sys.nodes.find((n) => n.id === activeNodeId) ?? sys.nodes[0];

  const switchSystem = (id: string) => {
    setSysId(id);
    const s = SYSTEMS.find((x) => x.id === id)!;
    setActiveNodeId(s.nodes.find((n) => n.core)?.id ?? s.nodes[0].id);
  };

  return (
    <section id="systems" aria-label="System architecture explorer" className="mx-auto max-w-6xl px-6 pb-section">
      <SectionHead index="02" title="Explore how I build systems" aside="Pick a system — click any stage" />

      {/* ── System tabs ── */}
      <Reveal className="mt-10">
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line pb-4">
          {SYSTEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => switchSystem(s.id)}
              aria-pressed={s.id === sysId}
              className={cn(
                "relative pb-1 text-[15px] transition-colors duration-200",
                s.id === sysId ? "text-ink" : "text-ink2 hover:text-ink"
              )}
            >
              {s.name}
              {s.id === sysId && (
                <motion.span
                  layoutId="systems-tab-underline"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-accent"
                />
              )}
            </button>
          ))}
        </div>
        <p className="mt-5 max-w-xl text-pretty text-[14.5px] leading-relaxed text-ink2">
          {sys.tagline}
        </p>
      </Reveal>

      {/* ── Assembling pipeline ── */}
      <div ref={pipelineRef} className="mt-14">
        {inView && (
          <div className="relative">
            {/* connector line — draws itself on entry (desktop) */}
            <motion.span
              aria-hidden
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="absolute left-[10%] right-[10%] top-[7px] hidden h-px origin-left bg-line lg:block"
            />
            <motion.ol
              key={sys.id}
              initial={reduce ? false : "hidden"}
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
              className="relative grid grid-cols-2 gap-y-9 sm:grid-cols-3 lg:grid-cols-5"
            >
              {sys.nodes.map((n, i) => {
                const isActive = n.id === activeNodeId;
                return (
                  <motion.li
                    key={n.id}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                    }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={() => setActiveNodeId(n.id)}
                      aria-pressed={isActive}
                      className="group flex flex-col items-center gap-3 px-2 text-center"
                    >
                      <span
                        className={cn(
                          "relative block h-[15px] w-[15px] rounded-full border transition-all duration-300",
                          isActive
                            ? "border-accent bg-accent shadow-[0_0_0_5px_rgba(180,68,44,0.10)]"
                            : "border-ink/50 bg-paper group-hover:border-ink"
                        )}
                      />
                      <span
                        className={cn(
                          "label transition-colors duration-200",
                          isActive ? "text-accent" : "group-hover:text-ink"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")} · {n.label}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        )}
      </div>

      {/* ── Detail panel ── */}
      <div className="mt-14 min-h-[210px] rounded-sm border border-line bg-paper2/60 p-6 sm:p-10" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${sys.id}-${node.id}`}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="label text-accent">
              Stage {String(sys.nodes.indexOf(node) + 1).padStart(2, "0")} — what I actually built
            </p>
            <h3 className="mt-3 font-serif-display text-2xl text-ink sm:text-[1.7rem]">
              {node.title}
            </h3>
            <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink2">
              {node.detail}
            </p>
            <p className="mt-5 text-[12.5px] text-ink2">{node.tags.join(" · ")}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
