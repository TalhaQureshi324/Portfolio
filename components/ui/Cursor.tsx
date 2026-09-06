"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Quiet cursor companion — a small lagging accent ring that
 * communicates interactivity. Desktop fine-pointer only, disabled
 * under reduced motion, and the native cursor is never hidden.
 * Elements can opt into a label via [data-cursor="Read"].
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-cursor], a, button");
      if (!target) {
        setLabel(null);
        return;
      }
      const custom = (target as HTMLElement).getAttribute?.("data-cursor");
      setLabel(custom ?? null);
    };
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseout", out);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[90]"
    >
      <motion.div
        animate={{
          width: label ? 52 : 12,
          height: label ? 52 : 12,
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.8 : 1,
          backgroundColor: label ? "rgba(180,68,44,0.92)" : "rgba(180,68,44,0)",
          borderColor: label ? "rgba(180,68,44,0)" : "rgba(180,68,44,0.55)",
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
      >
        {label && (
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-paper">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
