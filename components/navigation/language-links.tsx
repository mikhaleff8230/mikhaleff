"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicLanguage } from "@/lib/i18n/languages";
import { trackEvent } from "@/lib/analytics/events";

const languageLabel = (code: string) => code.toLowerCase() === "zh" ? "中文" : code.toUpperCase();

export function LanguageLinks({ locale, languages }: { locale: string; languages: readonly PublicLanguage[] }) {
  const pathname = usePathname();
  return <>{languages.map((language) => { const prefix = language.slugPrefix || language.code; const target = pathname.replace(/^\/[a-z]{2,3}(?:-[a-z]{2})?(?=\/|$)/i, `/${prefix}`); return <Link href={target || `/${prefix}`} lang={language.code} aria-label={language.nativeName} aria-current={locale === language.code ? "page" : undefined} onClick={() => trackEvent("change_language", { from: locale, to: language.code })} key={language.code}>{languageLabel(language.code)}</Link>; })}</>;
}
