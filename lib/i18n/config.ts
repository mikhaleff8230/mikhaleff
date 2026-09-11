export const fallbackLanguages = [
  { code: "en", nativeName: "EN", locale: "en-US", default: true },
  { code: "ru", nativeName: "RU", locale: "ru-RU", default: false },
  { code: "zh", nativeName: "中文", locale: "zh-CN", default: false },
] as const;

export const defaultLocale = fallbackLanguages.find((language) => language.default)?.code ?? "en";

export function isSupportedLocale(locale: string) {
  // Sanity may enable additional locales without requiring new route files.
  return fallbackLanguages.some((language) => language.code === locale) || /^[a-z]{2,3}(?:-[a-z]{2})?$/i.test(locale);
}
