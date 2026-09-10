import { NextResponse } from "next/server";
import { answerQuestion, answerWithLLM, sanitizeActions, type Turn } from "@/lib/assistant";
import { ALL_ENTRIES } from "@/lib/knowledge";

/**
 * "Ask Talha" endpoint — internet-facing, so:
 * - per-IP in-memory rate limit (20 questions / 10 min)
 * - input length + history caps
 * - LLM key(s) stay server-side; client never sees credentials
 * - actions are allowlisted; unknown targets are dropped
 * - the deterministic knowledge engine is always the fallback
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const MAX_QUESTION = 600;
const MAX_HISTORY = 12;

const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

// housekeeping so the map can't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of hits) if (now > rec.reset) hits.delete(ip);
}, 5 * 60 * 1000).unref?.();

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The assistant is taking a short breather — too many questions from this connection. Please try again in a few minutes.",
      },
      { status: 429 }
    );
  }

  let body: { question?: string; history?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const question = (body.question ?? "").toString().trim().slice(0, MAX_QUESTION);
  if (!question) {
    return NextResponse.json({ ok: false, error: "Empty question." }, { status: 400 });
  }

  const history: Turn[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (t): t is Turn =>
            t &&
            (t.role === "user" || t.role === "assistant") &&
            typeof t.content === "string"
        )
        .slice(-MAX_HISTORY)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 800) }))
    : [];

  try {
    // retrieval context for the optional LLM layer: top entries by relevance
    const { answerQuestion: localAnswer } = await import("@/lib/assistant");
    const base = localAnswer(question, history);
    const knowledgeContext = ALL_ENTRIES.filter((e) => e.id === base.topic || base.message.includes(e.message.slice(0, 40)))
      .map((e) => `${e.id}: ${e.message}`)
      .join("\n\n");

    const llm = await answerWithLLM(question, history, knowledgeContext || base.message);
    const answer = llm ?? base;
    return NextResponse.json({
      ok: true,
      message: answer.message,
      actions: sanitizeActions(answer.actions),
      followUps: answer.followUps.slice(0, 3),
    });
  } catch {
    // never expose internals
    return NextResponse.json(
      {
        ok: false,
        error:
          "The portfolio assistant is temporarily unavailable. You can still explore the portfolio directly below.",
      },
      { status: 500 }
    );
  }
}
