"use client";

import dynamic from "next/dynamic";

/** Lazy-mounted chat assistant — zero cost to initial page render. */
const AskTalha = dynamic(() => import("./AskTalha"), { ssr: false });

export default function Chat() {
  return <AskTalha />;
}
