"use client";

import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type DirectContact = {
  telegram?: string;
  whatsapp?: string;
};

export function HeaderContactMenu({ contact }: { contact: DirectContact }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };

  const supportsHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const previewOpen = () => {
    if (!supportsHover()) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setOpen(true), 110);
  };
  const previewClose = () => {
    if (!supportsHover()) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      clearHoverTimer();
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const contactRow = (label: string, href: string | undefined, icon: ReactNode) => href ? (
    <a href={href} target="_blank" rel="noreferrer" role="menuitem" onClick={() => setOpen(false)}>
      {icon}<span>{label}</span><b aria-hidden="true">→</b>
    </a>
  ) : (
    <span className="header-contact__unavailable" aria-disabled="true">
      {icon}<span>{label}</span><b aria-hidden="true">—</b>
    </span>
  );

  return (
    <div className="header-contact" ref={rootRef} onMouseEnter={previewOpen} onMouseLeave={previewClose}>
      <button className="header-contact__trigger" type="button" aria-label="Direct contact" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Send aria-hidden="true" />
      </button>
      <div className="header-contact__menu" role="menu" aria-label="Direct contact" data-open={open}>
        <p>Direct contact</p>
        <div className="header-contact__links">
          {contactRow("Telegram", contact.telegram, <Send aria-hidden="true" />)}
          {contactRow("WhatsApp", contact.whatsapp, <MessageCircle aria-hidden="true" />)}
        </div>
        <small>Response within 24 hours</small>
      </div>
    </div>
  );
}
