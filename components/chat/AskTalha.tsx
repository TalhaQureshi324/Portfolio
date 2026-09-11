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
  type: string;
  target?: string;
  auto?: boolean;
}
interface Msg {
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
  error?: boolean;
  streaming?: boolean;
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

/* Local preprocessing while the user TYPES — pure regex, zero network.
   Result is sent along on submit so the server skips re-deriving it. */
function detectHints(q: string): { intent?: string; techs?: string[] } {
  const techList = ["pytorch", "opencv", "playwright", "redis", "fastapi", "next.js", "n8n", "lime", "bert", "librosa", "websockets", "shopify", "streamlit", "llm", "kubernetes", "aws", "docker", "graphql", "postgresql"];
  const techs = techList.filter((t) => new RegExp(`\\b${t.replace(".", "\\.")}\\b`, "i").test(q));
  let intent: string | undefined;
  if (/interview/i.test(q)) intent = "INTERVIEW_QUESTIONS";
  else if (/\b(hire|hiring|recruiter|candidate|shortlist)\b|fit\b/i.test(q)) intent = "RECRUITER_FIT";
  else if (/we need|looking for|requirements/i.test(q)) intent = "JOB_REQUIREMENT_ANALYSIS";
  else if (/\b(contact|reach|email)\b/i.test(q)) intent = "CONTACT";
  else if (/\b(experience|career|intellimind)\b/i.test(q)) intent = "EXPERIENCE_QUERY";
  return { intent, techs: techs.length ? techs : undefined };
}

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
  const hintsRef = useRef<{ intent?: string; techs?: string[] }>({});

  // local intent/evidence detection runs WHILE TYPING (debounced 250ms,
  // no network calls) so submission finds its context already prepared
  useEffect(() => {
    const t = setTimeout(() => {
      hintsRef.current = input.trim() ? detectHints(input) : {};
    }, 250);
    return () => clearTimeout(t);
  }, [input]);

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
    if ((a.type === "scroll_to" || a.type === "scroll_to_project") && a.target) {
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

    // user message + streaming assistant placeholder
    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: "", streaming: true },
    ]);
    setLoading(true);

    const patchLast = (patch: Partial<Msg>) =>
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") next[next.length - 1] = { ...last, ...patch };
        return next;
      });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history, hints: hintsRef.current }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        patchLast({ content: data?.error ?? "The assistant is temporarily unavailable. Please try again.", error: true, streaming: false });
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const evt of events) {
          if (!evt.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(evt.slice(6)) as {
              type: string;
              text?: string;
              error?: string;
              actions?: ChatAction[];
              follow_ups?: string[];
            };
            if (payload.type === "delta" && payload.text) {
              // deltas APPEND — Gemini/GLM stream many small chunks
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "assistant")
                  next[next.length - 1] = { ...last, content: (last.content ?? "") + payload.text, streaming: true };
                return next;
              });
            } else if (payload.type === "meta") {
              // attach action chips; run navigation commands automatically
              if (Array.isArray(payload.actions) && payload.actions.length) {
                patchLast({ actions: payload.actions });
                const autoAction = payload.actions.find((a) => a.auto);
                if (autoAction) {
                  runAction(autoAction);
                  // on mobile the panel closes inside runAction; on desktop
                  // keep it open so the visitor can keep chatting
                }
              }
              // instant answers carry their follow-ups on meta
              if (Array.isArray(payload.follow_ups) && payload.follow_ups.length)
                setSuggestions(payload.follow_ups);
            } else if (payload.type === "done") {
              patchLast({ streaming: false });
              if (Array.isArray(payload.follow_ups)) setSuggestions(payload.follow_ups);
              setLoading(false);
            } else if (payload.type === "error") {
              patchLast({ content: payload.error ?? "The assistant is temporarily unavailable.", error: true, streaming: false });
            }
          } catch {
            /* ignore malformed event */
          }
        }
      }
      patchLast({ streaming: false });
      setLoading(false);
    } catch {
      patchLast({
        content: "The assistant is temporarily unavailable — the network didn't cooperate. Please try again.",
        error: true,
        streaming: false,
      });
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
            data-lenis-prevent
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

            {/* messages — bounded flex child; lenis/scroll-chaining contained
                here so wheel/touch never bleeds into the page behind */}
            <div
              ref={listRef}
              aria-live="polite"
              className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 [touch-action:pan-y]"
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
                        className={`whitespace-pre-line text-pretty text-[13.5px] leading-relaxed ${
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
