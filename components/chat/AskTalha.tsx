"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Sparkles, X as Close } from "lucide-react";
import { scrollToSection, highlightProjects } from "@/lib/utils";

/**
 * "Ask Talha" — portfolio intelligence assistant.
 * Editorial styling per the design system: paper surface, hairline
 * borders, sharp corners, mono metadata. Panel is lazy-loaded on
 * first open so the initial page payload is untouched.
 */

interface ChatAction {
  label: string;
  type: "scroll_to" | "resume" | "email" | "github" | "linkedin" | "contact_form";
  target?: string;
}
interface Msg {
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
  error?: boolean;
}

const INITIAL_SUGGESTIONS = [
  "What does Talha specialize in?",
  "Tell me about the malaria project.",
  "What are his strongest AI projects?",
  "How can I contact him?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "I'm Talha's portfolio assistant. Ask me about his projects, technical background, engineering decisions or experience — and I'll point you to the right place on this page.",
};

export default function AskTalha() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // focus management
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  // autoscroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, loading, reduce]);

  // escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function runAction(a: ChatAction) {
    if (a.type === "scroll_to" && a.target) {
      scrollToSection(a.target);
      if (a.target !== "contact" && a.target !== "expertise") {
        const projectId =
          a.target === "malaria-case-study" ? "malaria-screening" : a.target;
        highlightProjects([projectId]);
        setTimeout(() => highlightProjects(null), 3000);
      }
      if (window.innerWidth < 1024) close();
    } else if (a.type === "resume") {
      window.open("/Resume.pdf", "_blank");
    } else if (a.type === "email") {
      window.location.href = "mailto:iamtalhaqureshi849@gmail.com";
    } else if (a.type === "github") {
      window.open("https://github.com/TalhaQureshi324", "_blank");
    } else if (a.type === "linkedin") {
      window.open("https://www.linkedin.com/in/muhammad-talha-27b709331/", "_blank");
    } else if (a.type === "contact_form") {
      scrollToSection("contact");
      if (window.innerWidth < 1024) close();
    }
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.message, actions: data.actions },
        ]);
        if (Array.isArray(data.followUps)) setSuggestions(data.followUps);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error ?? "Something went wrong.", error: true },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "The assistant is temporarily unavailable — the network didn't cooperate. Your question can be retried.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const panelMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 16 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <>
      {/* launcher */}
      <motion.button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close Ask Talha assistant" : "Open Ask Talha assistant"}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[95] flex items-center gap-2.5 rounded-full border border-line bg-paper/90 py-2.5 pl-4 pr-5 shadow-card backdrop-blur-md transition-colors duration-300 hover:border-accent/60"
      >
        <span className="relative flex h-[7px] w-[7px]">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
          <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
          Ask Talha
        </span>
      </motion.button>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask Talha — portfolio assistant"
            {...panelMotion}
            className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[96] flex h-[min(76vh,620px)] flex-col overflow-hidden rounded-sm border border-line bg-paper shadow-card
                       sm:inset-x-auto sm:right-6 sm:h-[min(72vh,640px)] sm:w-[400px]"
          >
            {/* header */}
            <div className="flex items-start justify-between border-b border-line px-5 pb-4 pt-5">
              <div>
                <p className="label text-accent">Portfolio intelligence</p>
                <h2 className="mt-1.5 font-serif-display text-2xl leading-none text-ink">
                  Ask Talha
                </h2>
                <p className="mt-2 text-[12px] leading-snug text-ink3">
                  Projects, experience, engineering decisions — answered from
                  this page.
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Close assistant"
                className="rounded-sm p-1.5 text-ink2 transition-colors hover:bg-paper2 hover:text-ink"
              >
                <Close size={15} />
              </button>
            </div>

            {/* messages */}
            <div
              ref={listRef}
              aria-live="polite"
              className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={m.role === "user" ? "pl-8" : ""}
                >
                  {m.role === "assistant" ? (
                    <div className="border-l-2 border-accent/60 pl-3.5">
                      <p className="label mb-1.5">Ask Talha</p>
                      <p
                        className={`text-pretty text-[13.5px] leading-relaxed ${
                          m.error ? "text-accent" : "text-ink2"
                        }`}
                      >
                        {m.content}
                      </p>
                      {m.actions && m.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                          {m.actions.map((a) => (
                            <button
                              key={a.label}
                              onClick={() => runAction(a)}
                              className="group inline-flex items-center gap-1.5 text-[12.5px] text-ink transition-colors hover:text-accent"
                            >
                              <span className="underline decoration-accent/60 underline-offset-4 group-hover:decoration-accent">
                                {a.label}
                              </span>
                              <ArrowUpRight
                                size={12}
                                className="text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="ml-auto w-fit max-w-[85%] bg-paper2 px-3.5 py-2">
                      <p className="text-[13px] leading-relaxed text-ink">{m.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="border-l-2 border-accent/40 pl-3.5">
                  <p className="label mb-1.5">Ask Talha</p>
                  <p className="text-[13px] text-ink2">
                    Reading the portfolio
                    <span className="loading-dots" aria-hidden />
                  </p>
                </div>
              )}

              {/* suggestions */}
              {!loading && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="border border-line px-3 py-1.5 text-left text-[11.5px] text-ink2 transition-colors hover:border-accent/50 hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
            >
              <div className="flex items-center gap-3">
                <label htmlFor="ask-talha-input" className="sr-only">
                  Ask a question about Talha's portfolio
                </label>
                <input
                  id="ask-talha-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={600}
                  autoComplete="off"
                  placeholder="Ask about projects, skills, experience…"
                  className="w-full border-b border-line bg-transparent py-2 text-[13.5px] text-ink placeholder:text-ink3 outline-none transition-colors focus:border-ink"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send question"
                  className="shrink-0 bg-ink p-2 text-paper transition-colors hover:bg-accentdeep disabled:opacity-40"
                >
                  <ArrowUp size={14} />
                </button>
              </div>
              <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-ink3">
                <Sparkles size={10} className="text-accent/70" />
                Answers come from this page's content — nothing invented.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
