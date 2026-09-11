"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MenuItem = readonly [label: string, href: string];

export function MobileMenu({ locale, items }: { locale: string; items: readonly MenuItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button className="more-button" type="button" aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">{open ? "×" : "•••"}</span>
      </button>
      <div id="site-menu" className="menu-overlay" data-open={open} aria-hidden={!open}>
        <nav aria-label="Expanded navigation">
          {items.map(([label, href], index) => (
            <Link key={href} href={href.replace("/en", `/${locale}`)} tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}</Link>
          ))}
        </nav>
        <div className="menu-overlay__meta">
          <a href="mailto:hello@mikhaleff.art">hello@mikhaleff.art</a>
          <span>Europe</span>
        </div>
      </div>
    </>
  );
}
