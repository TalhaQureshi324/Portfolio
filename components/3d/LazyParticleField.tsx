"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

/**
 * Lazy loader for the WebGL canvas — the heavy three.js bundle is
 * only fetched client-side, and the render loop only runs while
 * the canvas is inside the viewport (IntersectionObserver).
 */
const ParticleCanvas = dynamic(() => import("./ParticleCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function LazyParticleField() {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer mount one frame so it never blocks first paint (CLS-safe)
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mounted || !holder.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    io.observe(holder.current);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div ref={holder} className="absolute inset-0" aria-hidden>
      {mounted && visible && <ParticleCanvas />}
    </div>
  );
}
