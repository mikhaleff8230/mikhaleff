"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationLinks({ locale, items }: { locale: string; items: readonly (readonly [string, string])[] }) {
  const pathname = usePathname();
  return <>{items.map(([label, href]) => { const localized = href.replace("/en", `/${locale}`); const current = pathname === localized || pathname.startsWith(`${localized}/`); return <Link key={href} href={localized} aria-current={current ? "page" : undefined}>{label}</Link>; })}</>;
}
