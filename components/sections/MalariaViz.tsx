"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/** Deterministic PRNG so SSR and client render identical cell fields */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Cell {
  x: number;
  y: number;
  r: number;
  infected: boolean;
}

/** Left pane — simulated Giemsa-stained thin film with live detection */
function SlideFeed({ cells }: { cells: Cell[] }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0D0F17]">
      <svg viewBox="0 0 300 240" className="block h-full w-full">
        {/* Plasma backdrop */}
        <rect width="300" height="240" fill="#0D0F17" />
        <rect width="300" height="240" fill="rgba(120,40,60,0.05)" />

        {/* Healthy RBCs */}
        {cells.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r={c.r}
              fill="rgba(190,90,100,0.16)"
              stroke="rgba(230,130,140,0.35)"
              strokeWidth="0.8"
            />
            <circle cx={c.x} cy={c.y} r={c.r * 0.55} fill="none" stroke="rgba(230,130,140,0.18)" strokeWidth="0.6" />
          </g>
        ))}

        {/* Infected cells — trophozoite ring + detection bbox */}
        {cells
          .filter((c) => c.infected)
          .map((c, i) => (
            <g key={`inf-${i}`}>
              <motion.rect
                x={c.x - c.r - 4}
                y={c.y - c.r - 4}
                width={(c.r + 4) * 2}
                height={(c.r + 4) * 2}
                rx="3"
                fill="none"
                stroke="#00F2FE"
                strokeWidth="1"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
              <circle cx={c.x} cy={c.y} r={c.r * 0.4} fill="none" stroke="#00F2FE" strokeWidth="1.4" />
              <circle cx={c.x + c.r * 0.15} cy={c.y - c.r * 0.1} r={c.r * 0.16} fill="#00F2FE" opacity="0.85" />
            </g>
          ))}

        {/* Microscope stage scan sweep */}
        <g className="slide-scan">
          <rect y="-30" width="300" height="30" fill="url(#scanGrad)" />
          <rect y="-1.5" width="300" height="1.5" fill="#00F2FE" opacity="0.55" />
        </g>
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00F2FE" stopOpacity="0" />
            <stop offset="1" stopColor="#00F2FE" stopOpacity="0.12" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-obsidian/85 px-3 py-1.5 font-mono text-[9px] backdrop-blur-sm">
        <span className="text-slate-500">LIVE SLIDE FEED · 100x OIL</span>
        <span className="text-emeraldx">MONOLAYER: LOCKED</span>
      </div>
    </div>
  );
}

/** Right pane — parasitemia gauge + species confidence */
function ParasitemiaPanel({ percent }: { percent: number }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  const species = [
    { name: "P. falciparum", conf: 0.97, w: "97%" },
    { name: "P. vivax", conf: 0.31, w: "31%" },
    { name: "P. malariae", conf: 0.12, w: "12%" },
  ];
  return (
    <div className="flex w-[38%] shrink-0 flex-col gap-3 rounded-lg border border-white/[0.06] bg-[#0D0F17] p-3">
      <div className="relative mx-auto h-[72px] w-[72px]">
        <svg viewBox="0 0 72 72" className="h-[72px] w-[72px] -rotate-90">
          <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
          <motion.circle
            cx="36" cy="36" r={R} fill="none"
            stroke="#00F2FE" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - percent / 100) }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: "drop-shadow(0 0 5px rgba(0,242,254,0.6))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-sm font-semibold text-white">{percent.toFixed(1)}%</span>
          <span className="font-mono text-[7px] text-slate-500">PARASITEMIA</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {species.map((s) => (
          <div key={s.name}>
            <div className="flex justify-between font-mono text-[8px] text-slate-500">
              <span>{s.name}</span>
              <span className="text-cyanx">{s.conf.toFixed(2)}</span>
            </div>
            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyanx to-azure"
                initial={false}
                animate={{ width: s.w }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-1.5 font-mono text-[8px] text-emeraldx">
        <span className="h-1 w-1 animate-pulse-dot rounded-full bg-emeraldx" />
        STAGE QUALITY: OK
      </div>
    </div>
  );
}

/**
 * Split-view flagship visual — raw microscopic feed with live
 * bounding-box detection on the left, parasitemia analytics on
 * the right. Deterministic cell field; jitter after mount only.
 */
export default function MalariaViz() {
  const cells = useMemo<Cell[]>(() => {
    const rand = mulberry32(1337);
    const out: Cell[] = [];
    for (let i = 0; i < 32; i++) {
      out.push({
        x: 14 + rand() * 272,
        y: 12 + rand() * 200,
        r: 7 + rand() * 6,
        infected: i % 7 === 3,
      });
    }
    // Keep bboxes away from panel edges
    return out.map((c) => ({
      ...c,
      x: Math.min(Math.max(c.x, 18), 282),
      y: Math.min(Math.max(c.y, 16), 204),
    }));
  }, []);

  const [percent, setPercent] = useState(2.4);
  useEffect(() => {
    const id = setInterval(() => setPercent(+(2.2 + Math.random() * 0.6).toFixed(1)), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.06] bg-obsidian/60 p-4">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-current text-cyanx" />
        LIVE DIAGNOSTIC VIEW — DETECTION OVERLAYS
      </p>
      <div className="flex min-h-[220px] flex-1 gap-3">
        <SlideFeed cells={cells} />
        <ParasitemiaPanel percent={percent} />
      </div>
    </div>
  );
}
