"use client";

import { useEffect, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { SOCIALS } from "@/lib/data";

/** Live local clock pinned to Pakistan Standard Time (UTC+5) */
function PktClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Karachi",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-xs text-slate-400">
      PKT (UTC+5) <span className="tabular-nums text-cyanx">{time}</span>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="hairline-flow absolute inset-x-0 top-0" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <p className="font-mono text-xs text-slate-500">
          © 2026 TALHA QURESHI — BUILT WITH{" "}
          <span className="text-slate-300">NEXT.JS · R3F · FRAMER MOTION</span>
        </p>

        <span className="flex items-center gap-2 font-mono text-xs text-emeraldx">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emeraldx" />
          ALL SYSTEMS OPERATIONAL
        </span>

        <div className="flex items-center gap-5">
          <PktClock />
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1">
            {[
              { href: SOCIALS.github, Icon: Github, label: "GitHub" },
              { href: SOCIALS.linkedin, Icon: Linkedin, label: "LinkedIn" },
              { href: SOCIALS.email, Icon: Mail, label: "Email" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="rounded-md p-1.5 text-slate-500 transition-colors hover:text-cyanx"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
