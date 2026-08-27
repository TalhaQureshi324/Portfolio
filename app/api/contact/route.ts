import { NextResponse } from "next/server";

/**
 * Serverless contact handler — serves both the standard form and
 * the CLI `contact` command. Validates, then delivers the message
 * to the owner's inbox via Resend (https://resend.com).
 *
 * Required environment variable (set in Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY     — API key from resend.com
 * Optional overrides:
 *   CONTACT_TO_EMAIL   — inbox that receives messages (default: owner's Gmail)
 *   CONTACT_FROM_EMAIL — verified sender (default: Resend's onboarding sender)
 */

const OWNER_EMAIL = "iamtalhaqureshi849@gmail.com";

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  scope?: string;
  budget?: string;
  source?: string;
}

function buildEmailHtml(p: Required<Pick<ContactPayload, "name" | "email" | "message">> & ContactPayload) {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font:600 13px -apple-system,Segoe UI,Roboto,sans-serif;color:#111827;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font:400 13px -apple-system,Segoe UI,Roboto,sans-serif;color:#374151;vertical-align:top">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html><body style="margin:0;background:#f3f4f6;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#090A0F;padding:18px 20px">
      <p style="margin:0;font:600 15px -apple-system,Segoe UI,Roboto,sans-serif;color:#00F2FE">New portfolio message</p>
      <p style="margin:4px 0 0;font:400 12px -apple-system,Segoe UI,Roboto,sans-serif;color:#9CA3AF">talha.dev — contact form relay</p>
    </div>
    <table style="width:100%;border-collapse:collapse">
      ${row("Name", p.name)}
      ${row("Email", `<a href="mailto:${p.email}" style="color:#2563EB">${p.email}</a>`)}
      ${row("Scope", p.scope ?? "—")}
      ${row("Budget", p.budget ?? "—")}
      ${row("Via", p.source === "cli" ? "Interactive terminal" : "Contact form")}
      ${row("Message", p.message.replace(/\n/g, "<br/>"))}
    </table>
    <div style="padding:14px 20px;background:#F9FAFB">
      <p style="margin:0;font:400 11px -apple-system,Segoe UI,Roboto,sans-serif;color:#6B7280">Hit “Reply” in your mail client to answer directly — the sender's address is attached.</p>
    </div>
  </div>
</body></html>`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactPayload;
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
    if (message.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Message too long (5000 char max)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY is not set — message dropped:", { name, email });
      return NextResponse.json(
        { ok: false, error: "Mail transport not configured yet. Try again shortly." },
        { status: 503 }
      );
    }

    const to = process.env.CONTACT_TO_EMAIL || OWNER_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email, // owner hits "Reply" → answers the visitor directly
        subject: `Coming from portfolio - Talha Qureshi - ${name}`,
        html: buildEmailHtml({ name, email, message, scope, budget, source }),
        text: `Name: ${name}\nEmail: ${email}\nScope: ${scope ?? "-"}\nBudget: ${budget ?? "-"}\nVia: ${source ?? "form"}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[contact] Resend error:", res.status, detail);
      return NextResponse.json(
        { ok: false, error: "Mail relay rejected the message. Try again shortly." },
        { status: 502 }
      );
    }

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