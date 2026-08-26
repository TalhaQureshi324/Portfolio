"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Download, Menu, SquareTerminal, X } from "lucide-react";
import { cn, openTerminal, scrollToSection } from "@/lib/utils";

const LINKS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "architecture", label: "Architecture" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/**
 * Fixed glassmorphic capsule nav.
 * - Hides on scroll-down, reveals on scroll-up (transform only).
 * - Center links share a spring layoutId underline indicator.
 */
export default function Navigation() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = lastY.current;
    setHidden(y > prev && y > 160 && !mobileOpen);
    lastY.current = y;
  });

  const go = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id);
  };

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: hidden ? -90 : 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-[70] px-4 pt-4"
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border border-white/[0.08] bg-obsidian/70 px-4 shadow-card backdrop-blur-xl sm:px-5">
        {/* Monogram + availability */}
        <button
          onClick={() => go("top")}
          className="flex cursor-pointer items-center gap-3"
          aria-label="Back to top"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyanx/30 bg-gradient-to-br from-cyanx/15 to-violetx/15 font-mono text-sm font-bold text-cyanx">
            &gt;_
          </span>
          <span className="hidden font-mono text-sm font-medium tracking-tight text-white sm:block">
            talha<span className="text-cyanx">.dev</span>
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-emeraldx/25 bg-emeraldx/[0.07] px-2.5 py-1 font-mono text-[10px] tracking-wide text-emeraldx md:flex">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emeraldx" />
            AVAILABLE FOR WORK
          </span>
        </button>

        {/* Center links with spring indicator */}
        <div className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setHovered(null)}>
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              onMouseEnter={() => setHovered(link.id)}
              className="relative rounded-lg px-3.5 py-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
              {hovered === link.id && (
                <motion.span
                  layoutId="nav-underline"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-cyanx to-violetx"
                />
              )}
            </button>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <a
            href="/Resume.pdf"
            download
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-slate-300 transition-all hover:border-cyanx/40 hover:text-cyanx sm:flex"
          >
            <Download size={13} />
            Resume.pdf
          </a>
          <button
            onClick={openTerminal}
            className="flex items-center gap-1.5 rounded-lg border border-violetx/30 bg-violetx/10 px-3 py-1.5 font-mono text-xs text-slate-200 transition-all hover:border-magenta/50 hover:bg-violetx/20"
          >
            <SquareTerminal size={13} className="text-magenta" />
            <span className="hidden sm:inline">Terminal</span>
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:text-white lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-white/[0.08] bg-obsidian/90 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col p-2">
              {LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => go(link.id)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-left font-mono text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-cyanx"
                  )}
                >
                  <span className="mr-2 text-cyanx/60">→</span>
                  {link.label}
                </button>
              ))}
              <a
                href="/Resume.pdf"
                download
                className="rounded-lg px-4 py-3 text-left font-mono text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-cyanx"
              >
                <span className="mr-2 text-cyanx/60">↓</span>
                Resume.pdf
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
