"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { PROJECTS, SKILLS_JSON, SOCIALS } from "@/lib/data";
import { cn } from "@/lib/utils";

type LineKind = "cmd" | "out" | "ok" | "err" | "sys" | "dim";
interface Line {
  id: number;
  kind: LineKind;
  text: string;
}

const BOOT_LINES: Array<[LineKind, string]> = [
  ["sys", "TALHA-DEV OS v3.2.1 — secure shell established"],
  ["dim", "Type `help` to list available commands."],
];

let lineId = 0;
const nextLine = (kind: LineKind, text: string): Line => ({ id: lineId++, kind, text });

/** Tokenize an input string, respecting quoted segments */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] ?? m[2] ?? m[3]);
  }
  return tokens;
}

/** Extract --key="value" flags from a token list */
function parseFlags(tokens: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (const t of tokens) {
    const m = t.match(/^--([\w-]+)=(.*)$/);
    if (m) flags[m[1]] = m[2];
    else if (t.startsWith("--")) flags[t.slice(2)] = "true";
  }
  return flags;
}

const HELP_TEXT = [
  "AVAILABLE COMMANDS",
  "  help                          show this list",
  "  whoami                        operator identity",
  "  skills [--all]                technical ability matrix (JSON)",
  "  projects                      flagship case studies",
  "  contact --name=.. --email=.. --msg=..   submit a message",
  "  socials                       external links",
  "  uptime                        session uptime",
  "  clear                         reset terminal canvas",
];

interface TerminalProps {
  onClose?: () => void;
  autoOpenBoot?: boolean;
  /** Focus the prompt on mount — only for terminals that open intentionally
   *  (the overlay drawer). Embedded terminals must NOT autofocus, or the
   *  browser scrolls the page to them on load. */
  focusOnMount?: boolean;
}

export default function Terminal({ onClose, autoOpenBoot = true, focusOnMount = false }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [bootTime] = useState(() => Date.now());
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence with slight typewriter cadence
  useEffect(() => {
    if (!autoOpenBoot) return;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const [kind, text] of BOOT_LINES) {
      timers.push(setTimeout(() => setLines((p) => [...p, nextLine(kind, text)]), 200 * ++i));
    }
    return () => timers.forEach(clearTimeout);
  }, [autoOpenBoot]);

  // Autoscroll on new output
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Focus only when explicitly requested (overlay opening) — never on page load
  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  const push = (...newLines: Array<[LineKind, string]>) =>
    setLines((prev) => [...prev, ...newLines.map(([k, t]) => nextLine(k, t))]);

  async function submitContact(flags: Record<string, string>) {
    const { name, email, msg } = flags;
    if (!name || !email || !msg) {
      push(["err", "usage: contact --name=\"Jane\" --email=\"j@x.com\" --msg=\"Hello\""]);
      return;
    }
    setBusy(true);
    push(["dim", "> transmitting payload..."]);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: msg, source: "cli" }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
      if (data.ok) {
        push(["ok", `✓ ${data.message ?? "Transmission received."}`]);
      } else {
        push(["err", `✗ ${data.error ?? "Transmission failed."}`]);
      }
    } catch {
      push(["err", "✗ Network unreachable — check your uplink."]);
    } finally {
      setBusy(false);
    }
  }

  async function exec(raw: string) {
    const trimmed = raw.trim();
    push(["cmd", trimmed]);
    if (!trimmed) return;

    const tokens = tokenize(trimmed);
    const cmd = tokens[0].toLowerCase();
    const flags = parseFlags(tokens.slice(1));

    switch (cmd) {
      case "help":
        push(...HELP_TEXT.map((t) => [t.startsWith("  ") ? "out" : "sys", t] as [LineKind, string]));
        break;
      case "whoami":
        push(
          ["out", "visitor@talha-dev"],
          ["dim", "You are talking to Talha Qureshi — AI Systems Engineer & Full-Stack Architect."]
        );
        break;
      case "skills": {
        if (flags.all === "true" || flags.all === undefined) {
          push(["ok", JSON.stringify(SKILLS_JSON, null, 2)]);
        } else {
          push(["out", "skills: pass --all for the full JSON payload"]);
        }
        break;
      }
      case "projects":
        PROJECTS.forEach((p) => {
          push(
            ["sys", `${p.num}. ${p.title}`],
            ["out", `   ${p.tagline}`],
            ["dim", `   stack: ${p.stack.join(", ")} · metrics: ${p.metrics.map((m) => m.value).join(" / ")}`]
          );
        });
        break;
      case "contact":
        await submitContact(flags);
        break;
      case "socials":
        push(
          ["out", `github   → ${SOCIALS.github}`],
          ["out", `linkedin → ${SOCIALS.linkedin}`],
          ["out", `email    → ${SOCIALS.email.replace("mailto:", "")}`]
        );
        break;
      case "uptime": {
        const s = Math.floor((Date.now() - bootTime) / 1000);
        push(["out", `up ${Math.floor(s / 60)}m ${s % 60}s · 1 user · load avg: 0.42 0.35 0.31`]);
        break;
      }
      case "clear":
        setLines([]);
        return;
      case "sudo":
        push(["err", "visitor is not in the sudoers file. This incident has been reported. 🙂"]);
        break;
      case "exit":
        onClose?.();
        break;
      default:
        push(["err", `command not found: ${cmd}`], ["dim", "try `help`"]);
    }
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !busy) {
      const value = input;
      setInput("");
      setHistIdx(-1);
      if (value.trim()) setHistory((h) => [...h, value]);
      void exec(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    }
  }

  const kindClass: Record<LineKind, string> = {
    cmd: "text-white",
    out: "text-slate-300",
    ok: "text-emeraldx",
    err: "text-rose-400",
    sys: "text-cyanx",
    dim: "text-slate-500",
  };

  return (
    <div
      className="flex h-full flex-col bg-[#0A0C13]"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed sm:text-[13px]"
      >
        {lines.map((line) => (
          <pre key={line.id} className={cn("whitespace-pre-wrap break-words", kindClass[line.kind])}>
            {line.kind === "cmd" ? (
              <>
                <span className="text-cyanx">visitor@talha-dev</span>
                <span className="text-slate-500">:~$ </span>
                {line.text}
              </>
            ) : (
              line.text
            )}
          </pre>
        ))}

        {/* Active prompt line */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap font-mono text-[12.5px] sm:text-[13px]">
            <span className="text-cyanx">visitor@talha-dev</span>
            <span className="text-slate-500">:~$ </span>
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            className="w-full bg-transparent font-mono text-[12.5px] text-white caret-cyanx outline-none sm:text-[13px]"
          />
        </div>
      </div>
    </div>
  );
}
