"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ContactForm } from "@/components/forms/contact-form";
import { trackEvent } from "@/lib/analytics/events";
import { getInterfaceCopy } from "@/lib/i18n/copy";

export function InquiryDialog({ artwork, locale = "en" }: { artwork: { slug: string; title: string }; locale?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const labels = getInterfaceCopy(locale).inquiry;
  useEffect(() => {
    const current = dialog.current;
    const onClose = () => { document.body.style.overflow = ""; };
    current?.addEventListener("close", onClose);
    return () => { current?.removeEventListener("close", onClose); document.body.style.overflow = ""; };
  }, []);
  const open = () => { dialog.current?.showModal(); document.body.style.overflow = "hidden"; trackEvent("click_inquire", { artwork: artwork.slug }); };
  const close = () => dialog.current?.close();
  return <><button className="inquire-link" type="button" onClick={open}>{labels.trigger} <span>→</span></button><dialog className="inquiry-dialog" ref={dialog} onClick={(event) => { if (event.target === dialog.current) close(); }}><div><button className="inquiry-dialog__close" type="button" onClick={close} aria-label={labels.close}><X /></button><p className="eyebrow">{labels.eyebrow}</p><h2>{artwork.title}</h2><ContactForm artwork={artwork} compact locale={locale} /></div></dialog></>;
}
