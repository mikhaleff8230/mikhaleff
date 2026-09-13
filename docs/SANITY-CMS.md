# Sanity CMS architecture

## Source of truth

Public content flows through `sanity/schemaTypes` → `lib/sanity/queries.ts` → `lib/content/repository.ts` → `types/content.ts` / generated `sanity.types.ts` → route and component renderers. UI labels that should not be editorial content are localized in `lib/i18n/copy.ts`.

## Studio structure

- SITE: singleton Global Settings and Languages.
- PAGES: singleton Homepage, About, Contact and Archive Pages.
- ART: Artworks, translated Materials / Mediums, Collections, Exhibitions and global Interior Scenes.
- CONTENT: Journal.

Singleton creation and delete/duplicate actions are disabled in `sanity.config.ts`; their stable IDs are `siteSettings`, `homepage`, `about`, `contact`, and `archivePages`.

## Documents

- `siteSettings`: title, contact/social links, localized footer location, navigation translations and default SEO.
- `homepage`: independent Hero, Statement and Exhibitions images; selected artworks; featured collection; localized section text and SEO.
- `about`: localized page/section copy, portrait, studio images, biography, statement, CV, press and SEO.
- `contact`: localized page/form presentation, independent image or artwork fallback and SEO. Email/social/location come from Global Settings.
- `archivePages`: localized settings and SEO for Works, Collections, Exhibitions and Journal indexes.
- `artwork`: localized identity/copy, canonical image, batch detail/texture images, video, relation to one collection, exhibitions, related works, display controls, locale-specific prices and SEO.
- `material`: one reusable material entity with EN/RU/ZH names; artwork filters display the current translation.
- `series`: localized collection copy and image; artworks point to the collection and are reverse-queried.
- `exhibition`: localized copy, images, dates/venue and reverse-queried artworks.
- `interiorScene`: one global calibrated scene used by every artwork View in Space.
- `journal`: localized title/excerpt/body, cover, relations and SEO.
- `language`: enabled languages and display metadata.

## Reusable objects

`localizedString`, `localizedText`, `localizedPortableText`, `imageWithMetadata`, `dimensions`, `seoFields`, `archivePageSettings`, and homepage section objects. Images store Sanity asset references with localized alt/caption metadata; frontend projections preserve original dimensions and render artwork with `object-fit: contain`.

## Localization and fallback

The field-level localization strategy is consistent: `{en, ru, zh}` objects. GROQ selects the active locale, then falls back EN → RU → ZH only when that translation is empty. Material names and artwork status are translated systemically. Prices never cross locales: EN=USD, RU=RUB, ZH=CNY; an absent localized price is hidden.

## Relations and galleries

Artwork `series` is the collection source of truth. Collection artwork lists are reverse queries. Artwork `exhibitions` is the exhibition source of truth. Legacy inverse arrays remain hidden/read-only only for backward compatibility. Gallery order is canonical main image → detail images → texture images. Detail and texture arrays support multi-file upload. Per-artwork interior images are legacy; global Interior Scenes are the only current View in Space source.

## Editing and extending

1. Add an editorial field to the correct singleton/entity schema using an existing localized or image object.
2. Add an explicit projection to `lib/sanity/queries.ts`.
3. Map it in `lib/content/repository.ts`, update the public content type, and render it.
4. If an old field contains data, migrate with `setIfMissing` or an explicit copy before hiding it.
5. Run `pnpm sanity:typegen`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm studio:build`, and `pnpm test:smoke`.

## Operations

Studio is built with `pnpm studio:build`. Schema types are extracted to `schema.json`; query types are generated in `sanity.types.ts`. Production migrations are in `scripts/` and are intentionally idempotent or targeted. Never expose a write token to browser code.