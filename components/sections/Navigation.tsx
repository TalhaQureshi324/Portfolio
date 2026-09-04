"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { cn, scrollToSection } from "@/lib/utils";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "expertise", label: "Expertise" },
  { id: "contact", label: "Contact" },
];

/**
 * Minimal editorial navigation — transparent over the hero,
 * condensing onto a paper surface with a hairline once scrolled.
 */
export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const go = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-paper/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-500",
          scrolled ? "py-3.5" : "py-6"
        )}
      >
        <button
          onClick={() => go("top")}
          className="font-serif-display text-lg text-ink"
          aria-label="Back to top"
        >
          Talha Qureshi
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="link-quiet text-[13px] text-ink2 transition-colors hover:text-ink"
            >
              {l.label}
            </button>
          ))}
          <a
            href="/Resume.pdf"
            download
            className="rounded-full border border-line px-4 py-1.5 text-[13px] text-ink transition-colors hover:border-ink"
          >
            Resume
          </a>
        </div>

        {/* Mobile trigger */}
        <button
          className="flex flex-col gap-[5px] p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span className={cn("h-px w-6 bg-ink transition-transform duration-300", mobileOpen && "translate-y-[3px] rotate-45")} />
          <span className={cn("h-px w-6 bg-ink transition-transform duration-300", mobileOpen && "-translate-y-[3px] -rotate-45")} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-line bg-paper transition-[max-height] duration-500 ease-out md:hidden",
          mobileOpen ? "max-h-96 border-b" : "max-h-0"
        )}
      >
        <div className="flex flex-col px-6 pb-6 pt-2">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="border-b border-line py-4 text-left font-serif-display text-xl text-ink"
            >
              {l.label}
            </button>
          ))}
          <a href="/Resume.pdf" download className="py-4 text-sm text-ink2">
            Download resume ↓
          </a>
        </div>
      </div>
    </header>
  );
}
