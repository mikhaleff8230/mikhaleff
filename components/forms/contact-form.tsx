"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/events";
import { getInterfaceCopy } from "@/lib/i18n/copy";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm({ artwork, compact = false, locale = "en", heading }: { artwork?: { slug: string; title: string }; compact?: boolean; locale?: string; heading?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const labels = getInterfaceCopy(locale).form;

  async function submit(formData: FormData) {
    setState("sending"); setMessage("");
    const payload: Record<string, FormDataEntryValue | string> = { ...Object.fromEntries(formData.entries()), url: window.location.href, locale };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "The message could not be sent.");
      setState("success"); trackEvent("submit_inquiry", { reason: String(payload.reason || labels.general), artwork: String(payload.artworkSlug || "none") });
      setMessage(result.message || labels.sent);
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "The message could not be sent."); }
  }

  return <form className={compact ? "contact-form contact-form--compact" : "contact-form"} action={submit}>
    {!compact && <><p className="eyebrow">{labels.eyebrow}</p><h2>{heading || labels.heading}</h2></>}
    {artwork && <div className="contact-form__subject"><span>{labels.artwork}</span><strong>{artwork.title}</strong><input type="hidden" name="artwork" value={artwork.title} /><input type="hidden" name="artworkSlug" value={artwork.slug} /></div>}
    <label>{labels.reason}<select name="reason" defaultValue={artwork ? labels.artworkInquiry : labels.general}><option>{labels.general}</option><option>{labels.artworkInquiry}</option><option>{labels.exhibition}</option><option>{labels.press}</option></select></label>
    <div className="contact-form__row"><label>{labels.name}<input name="name" autoComplete="name" required minLength={2} /></label><label>{labels.email}<input name="email" type="email" autoComplete="email" required /></label></div>
    <label>{labels.message}<textarea name="message" rows={compact ? 4 : 6} required minLength={10} /></label>
    <input className="honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <label className="contact-form__consent"><input name="consent" type="checkbox" value="true" required /><span>{labels.consent}</span></label>
    <button type="submit" disabled={state === "sending" || state === "success"}>{state === "sending" ? labels.sending : state === "success" ? labels.sent : labels.send}<span>→</span></button>
    <p className={`contact-form__status contact-form__status--${state}`} aria-live="polite">{message}</p>
  </form>;
}