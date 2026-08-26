"use client";

import { useRef, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}

/**
 * Spotlight card — tracks the cursor via CSS custom properties
 * (--mx / --my) and renders a soft azure radial gradient that
 * follows the pointer. GPU-only (opacity/transform) hover physics.
 */
export default function BentoCard({ children, className, variants }: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      variants={variants}
      whileHover={{ scale: 1.012 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60 shadow-card backdrop-blur-xl transition-colors duration-300 hover:border-cyanx/35",
        className
      )}
    >
      {/* Mouse spotlight — pure radial gradient, no repaints */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(79,172,254,0.10), transparent 70%)",
        }}
      />
      {/* Top hairline sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      {children}
    </motion.div>
  );
}
