"use client";

import { useEffect, useState } from "react";
import { SOCIALS } from "@/lib/data";

/** Live Pakistan Standard Time — real information, quietly displayed. */
function PktTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Karachi",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    fmt();
    const id = setInterval(fmt, 30000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time} PKT</span>;
}

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="font-serif-display text-xl text-ink">Talha Qureshi</p>
            <p className="mt-1 text-[13px] text-ink3">AI/ML engineer &amp; full-stack developer</p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5 text-[13.5px]">
            {[
              { href: SOCIALS.github, label: "GitHub" },
              { href: SOCIALS.linkedin, label: "LinkedIn" },
              { href: SOCIALS.email, label: SOCIALS.emailDisplay },
            ].map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="link-quiet w-fit text-ink2 hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5 text-[13px] text-ink2">
            <a href="/Resume.pdf" download className="link-quiet w-fit text-ink2 hover:text-ink">
              Download resume ↓
            </a>
            <PktTime />
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-line pt-6 text-[12px] text-ink2 sm:flex-row">
          <p>© 2026 Muhammad Talha Qureshi</p>
          <p>Designed &amp; built by me — Next.js, Tailwind, Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}
