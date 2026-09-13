import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const Inquiry = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(160),
  message: z.string().trim().min(10).max(5000),
  reason: z.string().trim().max(80),
  consent: z.literal("true"),
  company: z.string().max(0).optional().default(""),
  artwork: z.string().max(160).optional(),
  artworkSlug: z.string().max(160).optional(),
  url: z.string().url().max(500).or(z.literal("")).optional(),
  locale: z.enum(["en", "ru", "zh"]).optional(),
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 5;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = attempts.get(ip);
  if (current && current.resetAt > now && current.count >= LIMIT) return NextResponse.json({ ok: false, message: "Too many messages. Please try again later." }, { status: 429 });
  attempts.set(ip, current && current.resetAt > now ? { ...current, count: current.count + 1 } : { count: 1, resetAt: now + WINDOW });

  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 }); }
  const result = Inquiry.safeParse(payload);
  if (!result.success) return NextResponse.json({ ok: false, message: "Please check the required fields." }, { status: 400 });

  const host = process.env.MAIL_HOST;
  const username = process.env.MAIL_USERNAME;
  const password = process.env.MAIL_PASSWORD;
  const from = process.env.MAIL_FROM_ADDRESS || username;
  const recipient = process.env.INQUIRY_TO_EMAIL || "art@mikhaleff.art";
  if (!host || !username || !password || !from) return NextResponse.json({ ok: false, message: "Inquiry delivery is not configured yet. Please email art@mikhaleff.art." }, { status: 503 });

  const port = Number(process.env.MAIL_PORT || 587);
  const encryption = (process.env.MAIL_ENCRYPTION || "tls").toLowerCase();
  const data = result.data;
  const subject = `[mikhaleff.art] ${data.reason}${data.artwork ? ` — ${data.artwork}` : ""}`;
  const lines = [
    `Name: ${data.name}`, `Email: ${data.email}`, `Reason: ${data.reason}`,
    data.artwork ? `Artwork: ${data.artwork}${data.artworkSlug ? ` (${data.artworkSlug})` : ""}` : "",
    data.locale ? `Language: ${data.locale}` : "", data.url ? `Page: ${data.url}` : "", "", data.message,
  ].filter(Boolean);
  const html = `<h2>${escapeHtml(subject)}</h2>${lines.map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<hr>").join("")}`;

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465 || encryption === "ssl",
      auth: { user: username, pass: password },
      ...(encryption === "tls" ? { requireTLS: true } : {}),
    });
    await transport.sendMail({ from, to: recipient, replyTo: data.email, subject, text: lines.join("\n"), html });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] SMTP delivery failed", error instanceof Error ? error.message : "Unknown SMTP error");
    return NextResponse.json({ ok: false, message: "Delivery failed. Please email art@mikhaleff.art." }, { status: 502 });
  }
}