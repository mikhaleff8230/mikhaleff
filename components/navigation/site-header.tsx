import Link from "next/link";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { LanguageLinks } from "@/components/navigation/language-links";
import { NavigationLinks } from "@/components/navigation/navigation-links";
import { HeaderContactMenu } from "@/components/navigation/header-contact-menu";
import { getInterfaceCopy } from "@/lib/i18n/copy";
import { getLanguages } from "@/lib/i18n/languages";
import { getSiteSettings } from "@/lib/content/repository";

const navigation = [
  ["works", "/en/works"], ["series", "/en/collections"],
  ["exhibitions", "/en/exhibitions"], ["about", "/en/about"],
  ["journal", "/en/journal"], ["contact", "/en/contact"],
] as const;

export async function SiteHeader({ locale }: { locale: string }) {
  const [languages, settings] = await Promise.all([getLanguages(), getSiteSettings(locale)]);
  const labels = getInterfaceCopy(locale).nav;
  const translatedNavigation = navigation.map(([key, href], index) => [key === "series" ? labels[index] : settings.navigation.find((item) => item.key === key)?.label || labels[index], href, key] as const);
  return (
    <header className="site-header">
      <Link className="wordmark" href={`/${locale}`} aria-label="MIKHALEFF homepage">{settings.siteTitle}</Link>
      <nav className="site-nav" aria-label="Main navigation">
        <NavigationLinks locale={locale} items={translatedNavigation.map(([label, href]) => [label, href] as const)} />
      </nav>
      <div className="header-actions">
        <nav className="language-nav" aria-label="Languages">
          <LanguageLinks locale={locale} languages={languages} />
        </nav>
        <ThemeToggle />
        <HeaderContactMenu contact={{ telegram: settings.telegram, whatsapp: settings.whatsapp }} />
        <MobileMenu locale={locale} items={translatedNavigation.map(([label, href]) => [label, href] as const)} />
      </div>
    </header>
  );
}
