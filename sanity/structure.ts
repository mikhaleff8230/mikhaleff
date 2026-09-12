import type { StructureResolver } from "sanity/structure";

const singleton = (S: Parameters<StructureResolver>[0], title: string, type: string, id: string) =>
  S.listItem().title(title).child(S.document().schemaType(type).documentId(id));

export const structure: StructureResolver = (S) => S.list().title("MIKHALEFF STUDIO").items([
  S.listItem().title("SITE").child(S.list().title("SITE").items([
    singleton(S, "GLOBAL SETTINGS", "siteSettings", "siteSettings"),
    S.documentTypeListItem("language").title("LANGUAGES"),
  ])),
  S.listItem().title("PAGES").child(S.list().title("PAGES").items([
    singleton(S, "HOMEPAGE", "homepage", "homepage"),
    singleton(S, "ABOUT", "about", "about"),
    singleton(S, "CONTACT", "contact", "contact"),
    singleton(S, "ARCHIVE PAGES", "archivePages", "archivePages"),
  ])),
  S.listItem().title("ART").child(S.list().title("ART").items([
    S.documentTypeListItem("artwork").title("ARTWORKS"),
    S.documentTypeListItem("series").title("COLLECTIONS"),
    S.documentTypeListItem("exhibition").title("EXHIBITIONS"),
    S.documentTypeListItem("interiorScene").title("GLOBAL INTERIOR SCENES / VIEW IN SPACE"),
  ])),
  S.listItem().title("CONTENT").child(S.list().title("CONTENT").items([
    S.documentTypeListItem("journal").title("JOURNAL"),
  ])),
]);
