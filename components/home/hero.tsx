import { HeroExperience } from "@/components/home/hero-experience";
import { SiteHeader } from "@/components/navigation/site-header";
import type { HomepageContent } from "@/types/content";

export function Hero({ locale, hero }: { locale: string; hero: HomepageContent["hero"] }) {
  return <HeroExperience hero={hero} header={<SiteHeader locale={locale} />} />;
}
