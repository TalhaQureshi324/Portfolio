"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Gauge, Globe, Send } from "lucide-react";

const NODES = [
  { icon: Globe, title: "SCRAPER MODULE", sub: "multi-source domain + contact ingestion", color: "text-azure border-azure/30" },
  { icon: Gauge, title: "AUDIT BOT", sub: "headless perf / UX / SEO profiling", color: "text-cyanx border-cyanx/30" },
  { icon: BrainCircuit, title: "LLM PERSONALIZER", sub: "audit JSON → tailored pitch copy", color: "text-magenta border-magenta/30" },
  { icon: Send, title: "INSTANTLY DISPATCH", sub: "warmup · randomized intervals · webhooks", color: "text-emeraldx border-emeraldx/30" },
];

/**
 * Flagship visual — n8n-style node graph with pulsing data
 * packets traveling the connector paths, plus a live audit
 * throughput counter.
 */
export default function AutomationViz() {
  const [audits, setAudits] = useState(4_987);
  useEffect(() => {
    const id = setInterval(() => setAudits((a) => a + Math.floor(Math.random() * 4) + 1), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.06] bg-obsidian/60 p-4">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-current text-magenta" />
        ORCHESTRATION GRAPH — n8n DATA FLOW
      </p>

      <div className="flex flex-1 flex-col gap-0">
        {NODES.map((node, i) => (
          <div key={node.title}>
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-surface px-3.5 py-2.5"
            >
              <span className={`rounded-md border bg-white/[0.03] p-1.5 ${node.color}`}>
                <node.icon size={14} />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-wider text-white">{node.title}</p>
                <p className="truncate font-mono text-[9px] text-slate-500">{node.sub}</p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[8px] text-emeraldx">
                <span className="h-1 w-1 animate-pulse-dot rounded-full bg-emeraldx" />
                ACTIVE
              </span>
            </motion.div>
            {i < NODES.length - 1 && (
              <div className="flex justify-start pl-8">
                <div className="flow-track-v" style={{ "--flow-color": "#E100FF" } as React.CSSProperties} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-surface px-3.5 py-2">
        <span className="font-mono text-[9px] tracking-[0.15em] text-slate-500">AUDITS THIS WEEK</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-cyanx drop-shadow-[0_0_10px_rgba(0,242,254,0.45)]">
          {audits.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
