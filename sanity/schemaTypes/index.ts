import { about } from "./about";
import { artwork } from "./artwork";
import { contact } from "./contact";
import { exhibition } from "./exhibition";
import { homepage } from "./homepage";
import { journal } from "./journal";
import { interiorScene } from "./interiorScene";
import { language } from "./language";
import { series } from "./series";
import { siteSettings } from "./siteSettings";
import { dimensions } from "./objects/dimensions";
import { homepageSection } from "./objects/homepageSection";
import { imageWithMetadata } from "./objects/imageWithMetadata";
import { localizedPortableText } from "./objects/localizedPortableText";
import { localizedString } from "./objects/localizedString";
import { localizedText } from "./objects/localizedText";
import { seoFields } from "./objects/seoFields";

export const schemaTypes = [
  localizedString, localizedText, localizedPortableText, imageWithMetadata, dimensions, seoFields, homepageSection,
  language, artwork, series, exhibition, journal, interiorScene, homepage, about, contact, siteSettings,
];
