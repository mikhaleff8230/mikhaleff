import { ArtworkVideoBlock } from "@/components/artwork/artwork-video";
import type { HomepageContent } from "@/types/content";

export function HomeFilm({ content }: { content: HomepageContent["film"] }) {
  return (
    <section className="home-film" aria-label={content.title || content.eyebrow || "Film"} data-scroll-scene="home-film">
      <ArtworkVideoBlock video={content} variant="homepage" linkLabel={content.linkLabel} />
    </section>
  );
}