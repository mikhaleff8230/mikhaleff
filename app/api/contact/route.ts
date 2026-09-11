import { NextResponse } from "next/server";
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
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 5;

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

  // The production adapter is intentionally gated until the mailbox provider is connected.
  if (process.env.NODE_ENV === "production" && !process.env.INQUIRY_WEBHOOK_URL) return NextResponse.json({ ok: false, message: "Inquiry delivery is not configured yet. Please email hello@mikhaleff.art." }, { status: 503 });
  if (process.env.INQUIRY_WEBHOOK_URL) {
    const delivery = await fetch(process.env.INQUIRY_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result.data), signal: AbortSignal.timeout(8000) });
    if (!delivery.ok) return NextResponse.json({ ok: false, message: "Delivery failed. Please email hello@mikhaleff.art." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: process.env.INQUIRY_WEBHOOK_URL ? "Thank you. Your message has been received." : "Local preview: the form is valid. Delivery will activate when the email provider is connected." });
}
