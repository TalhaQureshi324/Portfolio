"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHead, Reveal } from "@/components/ui/primitives";
import { TECH_MAP, PROJECT_SHORT, EXTRA_TOOLS, type TechEntry } from "@/lib/data";
import { cn, highlightProjects } from "@/lib/utils";

/**
 * Interactive tech map — every technology is wired to the projects
 * that actually used it. Hover/tap/focus a technology: the panel
 * shows the real usage tree, and matching project representations
 * across the page light up via [data-project].
 */
export default function Expertise() {
  const reduce = useReducedMotion();
  const categories = useMemo(() => [...new Set(TECH_MAP.map((t) => t.category))], []);
  const [active, setActive] = useState<TechEntry>(TECH_MAP[0]);

  const show = (t: TechEntry) => {
    setActive(t);
    highlightProjects(t.uses.map((u) => u.projectId));
  };
  const clear = () => highlightProjects(null);

  return (
    <section id="expertise" aria-label="Technical expertise" className="border-t border-line bg-paper2/50">
      <div className="mx-auto max-w-6xl px-6 py-section">
        <SectionHead index="05" title="Technical expertise" />
        <Reveal>
          <p className="mt-6 max-w-xl text-[14.5px] leading-relaxed text-ink2">
            Not a wall of badges — every technology below is wired to the
            project where it was actually used.{" "}
            <span className="text-ink">Hover or tap one.</span>
          </p>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* ── Tech index ── */}
          <Reveal delay={0.05}>
            <div className="space-y-8" onMouseLeave={clear}>
              {categories.map((cat) => (
                <div key={cat}>
                  <p className="label mb-3 text-accent">{cat}</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
                    {TECH_MAP.filter((t) => t.category === cat).map((t) => {
                      const isActive = active.name === t.name;
                      return (
                        <li key={t.name}>
                          <button
                            onMouseEnter={() => show(t)}
                            onFocus={() => show(t)}
                            onBlur={clear}
                            onClick={() => show(t)}
                            aria-pressed={isActive}
                            className={cn(
                              "flex items-center gap-2 text-[15px] transition-colors duration-200",
                              isActive ? "font-medium text-ink" : "text-ink2 hover:text-ink"
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "inline-block h-[5px] w-[5px] rounded-full transition-colors duration-200",
                                isActive ? "bg-accent" : "bg-transparent"
                              )}
                            />
                            {t.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <p className="border-t border-line pt-5 text-[13px] leading-relaxed text-ink2">
                <span className="text-ink3">Also in the toolkit — </span>
                {EXTRA_TOOLS.join(" · ")}
              </p>
            </div>
          </Reveal>

          {/* ── Usage panel ── */}
          <Reveal delay={0.1}>
            <div className="self-start rounded-sm border border-line bg-paper/80 p-6 sm:p-9 lg:sticky lg:top-24" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.name}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="label">
                    used in {active.uses.length} project{active.uses.length > 1 ? "s" : ""}
                  </p>
                  <h3 className="mt-2 font-serif-display text-3xl text-ink sm:text-4xl">
                    {active.name}
                  </h3>

                  <ul className="mt-7 space-y-6">
                    {active.uses.map((u, i) => (
                      <li key={u.projectId} className="grid grid-cols-[26px_1fr] gap-1">
                        <span aria-hidden className="pt-1 font-mono text-[13px] text-accent">
                          {i === active.uses.length - 1 ? "└─" : "├─"}
                        </span>
                        <div>
                          <p className="text-[15px] font-medium text-ink">
                            {PROJECT_SHORT[u.projectId]}
                          </p>
                          <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink2">
                            {u.use}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-8 border-t border-line pt-4 text-[12px] leading-relaxed text-ink3">
                    Matching projects on this page light up while a technology
                    is selected.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
