import { NextResponse } from "next/server";
import { streamAssistant, type Turn } from "@/lib/assistant";

/**
 * "Ask Talha" endpoint — internet-facing, so:
 * - per-IP in-memory rate limit (30 questions / 10 min)
 * - input length + history caps
 * - LLM keys (GEMINI_API_KEY / GLM_API_KEY) stay server-side only
 * - responses stream as SSE: meta → deltas → done (or error)
 * - provider failure = honest "temporarily unavailable", never a fake answer
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
            !!t &&
            (t.role === "user" || t.role === "assistant") &&
            typeof t.content === "string"
        )
        .slice(-MAX_HISTORY)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 800) }))
    : [];

  const stream = streamAssistant(question, history);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
