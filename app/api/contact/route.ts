import { NextResponse } from "next/server";

/**
 * Serverless contact handler — serves both the standard form and
 * the CLI `contact` command. Validates and acknowledges; wire in
 * Resend / SendGrid / a database here when going live.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
      scope?: string;
      budget?: string;
      source?: string;
    };

    const { name, email, message, scope, budget, source } = body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, email, message." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Integrate a real provider here (Resend, SendGrid, DB insert…)
    console.log("[contact]", {
      from: source ?? "form",
      name,
      email,
      scope: scope ?? "-",
      budget: budget ?? "-",
      message: message.slice(0, 200),
    });

    return NextResponse.json({
      ok: true,
      message: "Transmission received. Response within 24h.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed payload." },
      { status: 400 }
    );
  }
}
