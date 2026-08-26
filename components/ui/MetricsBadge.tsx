"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricsBadgeProps {
  value: string;
  label: string;
  className?: string;
  valueClassName?: string;
}

/**
 * Monospace KPI counter — parses the numeric core of a metric
 * string (e.g. "98.4%", "<45ms", "+120%") and animates it from 0
 * when scrolled into view. Non-numeric decorations are preserved.
 */
export default function MetricsBadge({ value, label, className, valueClassName }: MetricsBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState("0");

  const match = value.match(/^(.*?)([\d.]+)(.*)$/);

  useEffect(() => {
    if (!inView || !match) return;
    const target = parseFloat(match[2]);
    const decimals = (match[2].split(".")[1] ?? "").length;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={ref} className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl",
          valueClassName
        )}
      >
        {match ? `${match[1]}${display}${match[3]}` : value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
    </div>
  );
}
