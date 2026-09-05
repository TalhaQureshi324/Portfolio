"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Reveal, SectionHead } from "@/components/ui/primitives";
import { SCOPES, BUDGETS, SOCIALS } from "@/lib/data";

type Status = "idle" | "sending" | "sent" | "error";

const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-ink";

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
        setServerMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setServerMsg("Network error — please email me directly instead.");
    }
  }

  return (
    <section id="contact" aria-label="Contact" className="mx-auto max-w-6xl px-6 py-section">
      <SectionHead index="06" title="Contact" />

      <div className="mt-14 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Invitation */}
        <Reveal>
          <h3 className="font-serif-display text-3xl leading-[1.15] text-ink sm:text-4xl">
            Have a problem worth solving?
          </h3>
          <p className="mt-5 max-w-md text-pretty text-[15.5px] leading-relaxed text-ink2">
            I&apos;m open to full-time roles and select freelance work in AI/ML
            and full-stack development. Tell me what you&apos;re building —
            I usually reply within a day.
          </p>
          <a
            href={SOCIALS.email}
            className="link-accent mt-8 inline-block font-serif-display text-xl text-ink sm:text-2xl"
          >
            {SOCIALS.emailDisplay}
          </a>
          <p className="mt-8 text-[13px] text-ink3">
            Prefer social?{" "}
            <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer" className="link-quiet text-ink">
              LinkedIn
            </a>{" "}
            ·{" "}
            <a href={SOCIALS.github} target="_blank" rel="noreferrer" className="link-quiet text-ink">
              GitHub
            </a>
          </p>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label mb-1 block">
                  Name
                </label>
                <input id="name" name="name" required placeholder="Your name" className={inputCls} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="email" className="label mb-1 block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className={inputCls}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="scope" className="label mb-1 block">
                  Project type
                </label>
                <select
                  id="scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className={`select-quiet ${inputCls} cursor-pointer pr-8`}
                >
                  {SCOPES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="budget" className="label mb-1 block">
                  Budget range
                </label>
                <select
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`select-quiet ${inputCls} cursor-pointer pr-8`}
                >
                  {BUDGETS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="label mb-1 block">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="What are you building, and where does it hurt?"
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-paper transition-colors duration-300 hover:bg-accentdeep disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    Sending <Loader2 size={15} className="animate-spin" />
                  </>
                ) : status === "sent" ? (
                  <>
                    Sent <Check size={15} />
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
              {status === "sent" && <p className="text-[13px] text-ink2">{serverMsg}</p>}
              {status === "error" && <p className="text-[13px] text-accent">{serverMsg}</p>}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
