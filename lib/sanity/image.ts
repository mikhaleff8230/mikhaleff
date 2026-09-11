import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

export function imageUrl(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source).auto("format").fit("max");
}
