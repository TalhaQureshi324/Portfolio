"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHead, Reveal } from "@/components/ui/primitives";
import { NOTES, PROJECT_SHORT } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Engineering Notes — short expandable answers that show how I
 * think. Every note is grounded in a real project on this page;
 * nothing is invented.
 */
export default function Notes() {
  const [open, setOpen] = useState<string | null>(NOTES[0].id);

  return (
    <section id="notes" aria-label="Engineering notes" className="mx-auto max-w-6xl px-6 py-section">
      <SectionHead index="03" title="Engineering notes" aside="How I think" />

      <Reveal className="mt-12">
        <p className="max-w-xl text-[14.5px] leading-relaxed text-ink2">
          Decisions matter more than tool names. Four notes on the reasoning
          behind the systems on this page.
        </p>
      </Reveal>

      <div className="mt-10 border-t border-line">
        {NOTES.map((note, i) => {
          const isOpen = open === note.id;
          return (
            <Reveal key={note.id} delay={Math.min(i * 0.04, 0.12)}>
              <div className="border-b border-line">
                <button
                  onClick={() => setOpen(isOpen ? null : note.id)}
                  aria-expanded={isOpen}
                  data-cursor={isOpen ? "Close" : "Read"}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={cn(
                      "font-serif-display text-lg transition-colors duration-300 sm:text-[1.35rem]",
                      isOpen ? "text-ink" : "text-ink2 group-hover:text-ink"
                    )}
                  >
                    {note.question}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "shrink-0 rounded-full border p-1.5 transition-all duration-300",
                      isOpen
                        ? "rotate-45 border-accent text-accent"
                        : "border-line text-ink2 group-hover:border-ink"
                    )}
                  >
                    <Plus size={14} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="max-w-3xl pb-8">
                        <p className="label mb-3 text-accent">
                          from {PROJECT_SHORT[note.projectId] ?? "the field"}
                        </p>
                        <p className="text-pretty text-[15px] leading-relaxed text-ink2">
                          {note.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
