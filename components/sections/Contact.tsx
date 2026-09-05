"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Reveal, SectionHead } from "@/components/ui/primitives";
import { SCOPES, BUDGETS, SOCIALS } from "@/lib/data";

type Status = "idle" | "sending" | "sent" | "error";

const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-[15px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-ink";

const EASE = [0.22, 1, 0.36, 1] as const;

const wordsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const wordVariant: Variants = {
  hidden: { y: "112%" },
  show: { y: "0%", transition: { duration: 0.8, ease: EASE } },
};

/** Masked word-by-word reveal for the closing statement. */
function FinalStatement() {
  const reduce = useReducedMotion();
  const words = ["Let's", "build", "something", "worth", "shipping."];
  return (
    <motion.h3
      variants={wordsContainer}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-20%" }}
      className="font-serif-display text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-[3.8rem]"
    >
      {words.map((w) => (
        <span key={w} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
          <motion.span variants={wordVariant} className="inline-block">
            {w}
            {"\u00A0"}
          </motion.span>
        </span>
      ))}
    </motion.h3>
  );
}

export default function Contact() {
  const [scope, setScope] = useState(SCOPES[0]);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

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
        formRef.current?.reset();
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
    <section id="contact" aria-label="Contact" className="border-t border-line bg-paper2/50">
      <div className="mx-auto max-w-6xl px-6 py-section">
        <SectionHead index="06" title="Contact" />

        {/* ── Final scene statement ── */}
        <div className="mt-16 sm:mt-20">
          <FinalStatement />
          <Reveal delay={0.5}>
            <p className="mt-6 max-w-lg text-pretty text-[16px] leading-relaxed text-ink2">
              Full-time roles, selective freelance, or a hard problem you
              want a second brain on — my inbox is open, and I usually reply
              within a day.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Invitation */}
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <h3 className="font-serif-display text-2xl leading-snug text-ink">
                Prefer email?
              </h3>
              <a
                href={SOCIALS.email}
                className="link-accent mt-4 inline-block break-all font-serif-display text-xl text-ink sm:text-2xl"
              >
                {SOCIALS.emailDisplay}
              </a>
              <p className="mt-8 text-[13px] text-ink2">
                Prefer social?{" "}
                <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer" className="link-quiet text-ink">
                  LinkedIn
                </a>{" "}
                ·{" "}
                <a href={SOCIALS.github} target="_blank" rel="noreferrer" className="link-quiet text-ink">
                  GitHub
                </a>
              </p>
              <p className="mt-10 flex items-center gap-2.5 text-[13px] text-ink2">
                <span className="inline-block h-[5px] w-[5px] rounded-full bg-accent" aria-hidden />
                Available for new opportunities — Pakistan (UTC+5)
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
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
      </div>
    </section>
  );
}
