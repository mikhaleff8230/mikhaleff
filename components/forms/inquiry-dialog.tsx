"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ContactForm } from "@/components/forms/contact-form";
import { trackEvent } from "@/lib/analytics/events";

export function InquiryDialog({ artwork }: { artwork: { slug: string; title: string } }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const current = dialog.current;
    const onClose = () => { document.body.style.overflow = ""; };
    current?.addEventListener("close", onClose);
    return () => { current?.removeEventListener("close", onClose); document.body.style.overflow = ""; };
  }, []);
  const open = () => { dialog.current?.showModal(); document.body.style.overflow = "hidden"; trackEvent("click_inquire", { artwork: artwork.slug }); };
  const close = () => dialog.current?.close();
  return <><button className="inquire-link" type="button" onClick={open}>Inquire about this work <span>→</span></button><dialog className="inquiry-dialog" ref={dialog} onClick={(event) => { if (event.target === dialog.current) close(); }}><div><button className="inquiry-dialog__close" type="button" onClick={close} aria-label="Close inquiry"><X /></button><p className="eyebrow">Private inquiry</p><h2>{artwork.title}</h2><ContactForm artwork={artwork} compact /></div></dialog></>;
}
