import type { StructureResolver } from "sanity/structure";

const singleton = (S: Parameters<StructureResolver>[0], title: string, type: string, id: string) =>
  S.listItem().title(title).child(S.document().schemaType(type).documentId(id));

export const structure: StructureResolver = (S) => S.list().title("MIKHALEFF STUDIO").items([
  S.documentTypeListItem("artwork").title("ARTWORKS"),
  S.documentTypeListItem("series").title("COLLECTIONS"),
  S.documentTypeListItem("exhibition").title("EXHIBITIONS"),
  S.documentTypeListItem("journal").title("JOURNAL"),
  S.divider(),
  singleton(S, "HOMEPAGE", "homepage", "homepage"),
  singleton(S, "ABOUT", "about", "about"),
  singleton(S, "CONTACT", "contact", "contact"),
  S.divider(),
  S.documentTypeListItem("language").title("LANGUAGES"),
  singleton(S, "SETTINGS", "siteSettings", "siteSettings"),
]);
