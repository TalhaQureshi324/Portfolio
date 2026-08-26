"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Send } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import Terminal from "@/components/ui/Terminal";
import { cn } from "@/lib/utils";

const SCOPES = ["AI / ML System", "Full-Stack App", "Commerce Build", "Something Else"];
const BUDGETS = ["< $1k", "$1k – $5k", "$5k – $15k", "Enterprise"];

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [scope, setScope] = useState(SCOPES[0]);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          scope,
          budget,
          source: "form",
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
      if (data.ok) {
        setStatus("sent");
        setServerMsg(data.message ?? "Message sent.");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
        setServerMsg(data.error ?? "Transmission failed.");
      }
    } catch {
      setStatus("error");
      setServerMsg("Network unreachable — try the terminal instead.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/[0.08] bg-obsidian/70 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyanx/50 focus:ring-1 focus:ring-cyanx/25";

  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <SectionHeading
        kicker="// 05 — ESTABLISH UPLINK"
        title="Contact"
        sub="Two channels: standard form, or the CLI if that's how you roll. Both hit the same endpoint."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Standard form ── */}
        <Reveal>
          <form
            onSubmit={onSubmit}
            className="flex h-full flex-col gap-5 rounded-2xl border border-white/[0.08] bg-surface/60 p-6 backdrop-blur-xl sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-slate-500">
                  NAME
                </label>
                <input id="name" name="name" required placeholder="Jane Doe" className={inputCls} />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-slate-500">
                  EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-slate-500">PROJECT SCOPE</p>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setScope(s)}
                    className={cn(
                      "rounded-lg border px-3.5 py-2 text-xs transition-all",
                      scope === s
                        ? "border-cyanx/50 bg-cyanx/10 text-cyanx"
                        : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-slate-500">BUDGET TIER</p>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBudget(b)}
                    className={cn(
                      "rounded-lg border px-3.5 py-2 font-mono text-xs transition-all",
                      budget === b
                        ? "border-violetx/50 bg-violetx/10 text-magenta"
                        : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="message" className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-slate-500">
                MESSAGE
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Describe the system you want built..."
                className={cn(inputCls, "min-h-[110px] resize-none")}
              />
            </div>

            <div className="flex items-center gap-4">
              <MagneticButton
                className={cn(
                  "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                  status === "sent"
                    ? "bg-emeraldx text-obsidian"
                    : "bg-gradient-to-r from-cyanx to-azure text-obsidian shadow-glow-cyan hover:shadow-[0_0_50px_-8px_rgba(0,242,254,0.7)]"
                )}
              >
                {status === "sending" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Transmitting...
                  </>
                ) : status === "sent" ? (
                  <>
                    <Check size={16} /> Received
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Message
                  </>
                )}
              </MagneticButton>

              {status === "sent" && (
                <p className="font-mono text-xs text-emeraldx">✓ {serverMsg}</p>
              )}
              {status === "error" && (
                <p className="font-mono text-xs text-rose-400">✗ {serverMsg}</p>
              )}
            </div>
          </form>
        </Reveal>

        {/* ── Interactive terminal ── */}
        <Reveal delay={0.1} className="h-full">
          <div className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0C13]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-slate-500">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emeraldx" />
                INTERACTIVE — TRY `help`
              </span>
              <span className="font-mono text-[10px] text-slate-600">zsh · utf-8</span>
            </div>
            <div className="min-h-0 flex-1">
              <Terminal />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
