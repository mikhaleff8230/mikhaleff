import { ContactBand } from "@/components/home/contact-band";
import { Exhibitions } from "@/components/home/exhibitions";
import { FeaturedSeries } from "@/components/home/featured-series";
import { Hero } from "@/components/home/hero";
import { HomeFilm } from "@/components/home/home-film";
import { SelectedWorks } from "@/components/home/selected-works";
import { Statement } from "@/components/home/statement";
import { SiteFooter } from "@/components/layout/site-footer";
import type { HomepageContent } from "@/types/content";

export function Homepage({ locale, content }: { locale: string; content: HomepageContent }) {
  return (
    <main id="top">
      <Hero locale={locale} hero={content.hero} />
      <Statement locale={locale} content={content.statement} />
      {content.film.enabled && <HomeFilm content={content.film} />}
      <SelectedWorks locale={locale} content={content.selectedWorks} />
      <FeaturedSeries locale={locale} content={content.featuredSeries} />
      <Exhibitions locale={locale} content={content.exhibitions} />
      <ContactBand locale={locale} content={content.contact} />
      <SiteFooter locale={locale} />
    </main>
  );
}
