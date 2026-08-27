"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus } from "lucide-react";
import Terminal from "./Terminal";

/**
 * Global floating terminal drawer. Any component can open it by
 * dispatching `portfolio:open-terminal` (see lib/utils.openTerminal).
 * Esc closes; the drawer springs up from the bottom edge.
 */
export default function TerminalOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("portfolio:open-terminal", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("portfolio:open-terminal", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-obsidian/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 560, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 560, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[85] mx-auto flex h-[min(68vh,520px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-b-0 border-white/10 bg-[#0A0C13] shadow-[0_-20px_80px_-20px_rgba(0,242,254,0.15)]"
          >
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-surface/80 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <span className="font-mono text-xs text-slate-400">
                  zsh — visitor@talha-dev: ~/portfolio
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Minimize terminal"
                  className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close terminal"
                  className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <Terminal focusOnMount onClose={() => setOpen(false)} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
