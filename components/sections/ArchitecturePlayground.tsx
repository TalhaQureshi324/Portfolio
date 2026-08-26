"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Gauge, HardDrive, Users, Zap } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Capacity model — a plausible simulation of a 1.2B-param
   inference service. Tune batch, quantization, concurrency
   and GPU tier; memory / throughput / cost respond live.
   ───────────────────────────────────────────────────────────── */
type Quant = "FP32" | "FP16" | "INT8";
const QUANT_BYTES: Record<Quant, number> = { FP32: 4, FP16: 2, INT8: 1 };
const QUANT_LATENCY: Record<Quant, number> = { FP32: 1.7, FP16: 1.0, INT8: 0.65 };
const PARAMS_B = 1.2;

const GPUS = [
  { id: "t4", label: "T4", vram: 16, rate: 0.35 },
  { id: "a10g", label: "A10G", vram: 24, rate: 0.75 },
  { id: "a100", label: "A100", vram: 80, rate: 2.5 },
] as const;
type GpuId = (typeof GPUS)[number]["id"];

function simulate(batch: number, quant: Quant, users: number, gpuId: GpuId) {
  const gpu = GPUS.find((g) => g.id === gpuId)!;

  const weightsGB = PARAMS_B * QUANT_BYTES[quant];
  const activationGB = batch * 0.004 * (quant === "INT8" ? 0.6 : 1);
  const kvGB = users * 0.0009;
  const runtimeGB = 0.6;
  const memoryGB = weightsGB + activationGB + kvGB + runtimeGB;

  const latencyMs = (14 + batch * 0.32 + users * 0.055) * QUANT_LATENCY[quant];
  const rps = Math.max(1, Math.round((users * 1000) / latencyMs));

  const instances = Math.max(1, Math.ceil(memoryGB / (gpu.vram * 0.92)));
  const costHr = instances * gpu.rate + rps * 0.00012;

  const fits = memoryGB <= gpu.vram;
  const utilization = Math.min(1, memoryGB / gpu.vram);

  let verdict: { text: string; tone: "ok" | "warn" | "bad" };
  if (!fits) {
    verdict = {
      text: `OOM RISK — needs ${memoryGB.toFixed(1)}GB on a ${gpu.vram}GB card. Quantize further or scale out.`,
      tone: "bad",
    };
  } else if (utilization > 0.82) {
    verdict = {
      text: `Tight fit — ${(utilization * 100).toFixed(0)}% of ${gpu.label} VRAM. Headroom is thin for traffic spikes.`,
      tone: "warn",
    };
  } else {
    verdict = {
      text: `Healthy deployment — fits comfortably on a single ${gpu.label} with ${(100 - utilization * 100).toFixed(0)}% headroom.`,
      tone: "ok",
    };
  }

  return { memoryGB, latencyMs, rps, costHr, instances, fits, utilization, verdict };
}

function Readout({
  icon: Icon,
  label,
  value,
  unit,
  bar,
  barColor,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  unit: string;
  bar: number;
  barColor: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-obsidian/60 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
          <Icon size={12} /> {label}
        </span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white">
        {value}
        <span className="ml-1 text-xs font-normal text-slate-500">{unit}</span>
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          animate={{ width: `${Math.min(100, bar * 100)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export default function ArchitecturePlayground() {
  const [batch, setBatch] = useState(32);
  const [quant, setQuant] = useState<Quant>("FP16");
  const [users, setUsers] = useState(128);
  const [gpuId, setGpuId] = useState<GpuId>("a10g");

  const sim = useMemo(() => simulate(batch, quant, users, gpuId), [batch, quant, users, gpuId]);
  const gpu = GPUS.find((g) => g.id === gpuId)!;

  const sliderFill = (v: number, min: number, max: number) =>
    ({ "--fill": `${((v - min) / (max - min)) * 100}%` } as React.CSSProperties);

  const verdictStyle = {
    ok: "border-emeraldx/30 bg-emeraldx/[0.06] text-emeraldx",
    warn: "border-amber-400/30 bg-amber-400/[0.06] text-amber-300",
    bad: "border-rose-500/30 bg-rose-500/[0.06] text-rose-400",
  }[sim.verdict.tone];

  return (
    <section id="architecture" className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <SectionHeading
        kicker="// 03 — LIVE SANDBOX"
        title="Architecture Playground"
        sub="Configure a mock inference pipeline. Watch memory footprint, throughput and compute cost respond in real time."
      />

      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60 backdrop-blur-xl">
          {/* Window chrome */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500">
              capacity_planner.exe — 1.2B PARAM INFERENCE SERVICE
            </span>
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-cyanx/60" />
            </span>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
            {/* ── Controls ── */}
            <div className="space-y-7">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 font-mono text-xs text-slate-300">
                    <Users size={13} className="text-cyanx" /> Batch size
                  </label>
                  <span className="rounded-md border border-cyanx/25 bg-cyanx/[0.08] px-2 py-0.5 font-mono text-xs text-cyanx">
                    {batch}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={128}
                  value={batch}
                  onChange={(e) => setBatch(+e.target.value)}
                  className="slider"
                  style={sliderFill(batch, 1, 128)}
                  aria-label="Batch size"
                />
                <div className="mt-1 flex justify-between font-mono text-[9px] text-slate-600">
                  <span>1</span><span>128</span>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 font-mono text-xs text-slate-300">
                    <Users size={13} className="text-magenta" /> Concurrent users
                  </label>
                  <span className="rounded-md border border-magenta/25 bg-magenta/[0.08] px-2 py-0.5 font-mono text-xs text-magenta">
                    {users}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={512}
                  value={users}
                  onChange={(e) => setUsers(+e.target.value)}
                  className="slider"
                  style={sliderFill(users, 1, 512)}
                  aria-label="Concurrent users"
                />
                <div className="mt-1 flex justify-between font-mono text-[9px] text-slate-600">
                  <span>1</span><span>512</span>
                </div>
              </div>

              <div>
                <p className="mb-3 flex items-center gap-2 font-mono text-xs text-slate-300">
                  <Zap size={13} className="text-emeraldx" /> Model quantization
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(QUANT_BYTES) as Quant[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuant(q)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 font-mono text-xs transition-all",
                        quant === q
                          ? "border-emeraldx/50 bg-emeraldx/10 text-emeraldx"
                          : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
                      )}
                    >
                      {q}
                      <span className="block text-[9px] opacity-60">
                        {QUANT_BYTES[q]}B / param
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 flex items-center gap-2 font-mono text-xs text-slate-300">
                  <Cpu size={13} className="text-azure" /> GPU tier
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {GPUS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGpuId(g.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 font-mono text-xs transition-all",
                        gpuId === g.id
                          ? "border-azure/50 bg-azure/10 text-azure"
                          : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
                      )}
                    >
                      {g.label}
                      <span className="block text-[9px] opacity-60">{g.vram}GB · ${g.rate}/h</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Live readouts ── */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Readout
                  icon={HardDrive}
                  label="Memory footprint"
                  value={sim.memoryGB.toFixed(2)}
                  unit={`/ ${gpu.vram}GB`}
                  bar={sim.memoryGB / gpu.vram}
                  barColor="bg-gradient-to-r from-cyanx to-azure"
                />
                <Readout
                  icon={Gauge}
                  label="Throughput"
                  value={sim.rps.toLocaleString()}
                  unit="req/s"
                  bar={sim.rps / 2500}
                  barColor="bg-gradient-to-r from-violetx to-magenta"
                />
                <Readout
                  icon={Zap}
                  label="Est. latency"
                  value={sim.latencyMs.toFixed(0)}
                  unit="ms / req"
                  bar={sim.latencyMs / 400}
                  barColor="bg-gradient-to-r from-azure to-cyanx"
                />
                <Readout
                  icon={Cpu}
                  label="Compute cost"
                  value={`$${sim.costHr.toFixed(2)}`}
                  unit={`/ hr · ×${sim.instances} inst`}
                  bar={sim.costHr / 6}
                  barColor="bg-gradient-to-r from-emeraldx to-cyanx"
                />
              </div>

              <motion.div
                key={sim.verdict.text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={cn("rounded-xl border p-4 font-mono text-xs leading-relaxed", verdictStyle)}
              >
                <span className="mr-2">{sim.verdict.tone === "ok" ? "✓" : sim.verdict.tone === "warn" ? "⚠" : "✗"}</span>
                {sim.verdict.text}
              </motion.div>

              <div className="mt-auto rounded-xl border border-white/[0.06] bg-obsidian/60 p-4 font-mono text-[10px] leading-loose text-slate-500">
                <p><span className="text-slate-300">weights</span> = {PARAMS_B}B × {QUANT_BYTES[quant]}B → {sim.memoryGB.toFixed(2).split(".")[0]}GB-class</p>
                <p><span className="text-slate-300">topology</span> = {sim.instances}× {gpu.label} · {quant} · bs={batch}</p>
                <p className="text-slate-600">// simulation only — real benchmarks on request</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
