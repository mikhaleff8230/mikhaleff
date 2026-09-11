"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/events";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm({ artwork, compact = false }: { artwork?: { slug: string; title: string }; compact?: boolean }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setState("sending");
    setMessage("");
    const payload: Record<string, FormDataEntryValue | string> = { ...Object.fromEntries(formData.entries()), url: window.location.href };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "The message could not be sent.");
      setState("success");
      trackEvent("submit_inquiry", { reason: String(payload.reason || "General inquiry"), artwork: String(payload.artworkSlug || "none") });
      setMessage(result.message || "Thank you. Your message has been received.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The message could not be sent.");
    }
  }

  return (
    <form className={compact ? "contact-form contact-form--compact" : "contact-form"} action={submit}>
      {!compact && <><p className="eyebrow">Direct inquiry</p><h2>Get in Touch</h2></>}
      {artwork && <div className="contact-form__subject"><span>Artwork</span><strong>{artwork.title}</strong><input type="hidden" name="artwork" value={artwork.title} /><input type="hidden" name="artworkSlug" value={artwork.slug} /></div>}
      <label>Reason<select name="reason" defaultValue={artwork ? "Artwork inquiry" : "General inquiry"}><option>General inquiry</option><option>Artwork inquiry</option><option>Exhibition proposal</option><option>Press</option></select></label>
      <div className="contact-form__row"><label>Name<input name="name" autoComplete="name" required minLength={2} /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label></div>
      <label>Message<textarea name="message" rows={compact ? 4 : 6} required minLength={10} /></label>
      <input className="honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="contact-form__consent"><input name="consent" type="checkbox" value="true" required /><span>I agree that my details may be used to answer this inquiry.</span></label>
      <button type="submit" disabled={state === "sending" || state === "success"}>{state === "sending" ? "Sending…" : state === "success" ? "Message sent" : "Send message"}<span>→</span></button>
      <p className={`contact-form__status contact-form__status--${state}`} aria-live="polite">{message}</p>
    </form>
  );
}
