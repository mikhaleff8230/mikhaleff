# MIKHALEFF Sanity CMS architecture

## Source of truth

Sanity project `lqcc213n`, dataset `production`, is the source of editorial content. The frontend reads it through `lib/sanity/queries.ts` and normalizes query results in `lib/content/repository.ts`. Generated schema/query types live in `sanity.types.ts`.

The repository uses this data flow:

`Sanity schema → published document → defineQuery GROQ → Sanity TypeGen result → repository view model → page/component`

When a field is changed, every link in this chain must be updated and verified.

## Studio information architecture

- SITE
  - Global settings: identity, navigation, direct contacts, social links, default SEO.
  - Languages: locale definitions and ordering.
- PAGES
  - Homepage singleton.
  - About singleton.
  - Contact singleton.
  - Archive Pages singleton: localized Works, Collections, Exhibitions, and Journal introductions, optional Hero images, and per-page SEO.
- ART
  - Artworks.
  - Collections (`series` is retained as the internal schema name for compatibility).
  - Exhibitions.
  - Global Interior Scenes / View in Space.
- CONTENT
  - Journal.

Singletons cannot be created from the global New document menu and do not expose duplicate/delete actions.

## Artwork image model

- `mainImage`: canonical artwork image. Required. It is always rendered complete with its original aspect ratio in the detail page and fullscreen viewer.
- `galleryImage`: one optional archive/grid crop. This is not a gallery. When empty, the archive uses `mainImage`.
- `detailImages`: ordered close-up images. Their own source dimensions and aspect ratios are preserved in the opening gallery, thumbnail rail, detail viewer, and fullscreen viewer.
- `textureImages`: additional ordered close-ups, handled like detail images.
- `videoPoster`: image used only as a video poster.
- `interiorImages`: legacy read-only data kept so old uploads are not lost. It is no longer used by the site.

No frontend image filter changes an artwork between Dark and Light themes. The primary artwork is never sent through a forced crop URL.

## Global View in Space scenes

Interior environments are global `interiorScene` documents. Edit them once under `ART → GLOBAL INTERIOR SCENES / VIEW IN SPACE`; every artwork uses the updated scenes. Each scene contains desktop and optional mobile image, physical wall size, normalized wall bounds, wall-color permission, ordering, and enabled state.

An Artwork controls only whether View in Space is enabled, its preferred global scene, frame permission, and measured-scale permission. Free preview is the default at 52%. Visitors may select a local room photo; it is rendered through an in-memory blob URL and is never uploaded or saved.

## Homepage images

Homepage imagery is independent from Artwork documents:

- `heroImageOverride`: required Hero background image. `heroArtwork` supplies caption metadata only.
- `statementImageOverride`: required independent image for the Statement section.
- `exhibitionsImage`: independent image for the exhibitions block.

Changing an artwork image no longer silently changes either homepage section, and the Hero image is not reused for the next block.

## Relationships

The single source of truth for collection membership is `Artwork.series`. Collection pages calculate their artwork list using a reverse GROQ reference query. The old `Series.artworks` field remains hidden/read-only only for data compatibility.

The single source of truth for exhibition membership used by the artwork archive is `Artwork.exhibitions`. The old `Exhibition.artworks` field remains hidden/read-only.

## Localization

Localized editorial values use the same field-level objects: `localizedString`, `localizedText`, and `localizedPortableText`, with `en`, `ru`, and `zh` keys. Queries select the requested locale and fall back in the order EN → RU → ZH. Interface-only labels belong in `lib/i18n/copy.ts`; editorial wording belongs in Sanity. Navigation labels are managed in Global settings.

## Query and type workflow

All active GROQ exports use `defineQuery`. After any schema or query change run:

```bash
pnpm sanity:typegen
pnpm typecheck
pnpm build
pnpm studio:build
npx sanity documents validate --dataset production --format pretty
```

`pnpm sanity:typegen` overwrites `schema.json` safely and regenerates `sanity.types.ts`. Repository types are UI view models; generated query-result types are used at the CMS boundary so schema/query drift is caught before normalization.

## Migrations

Migration scripts are additive and idempotent:

- `scripts/migrate-homepage-independent-images.ts` copies existing source images into independent Homepage fields.
- `scripts/migrate-homepage-content.ts` initializes only missing localized Homepage editorial fields with `setIfMissing`.

Legacy fields are not physically removed until a separate, reviewed cleanup confirms they are no longer needed.

## Failure policy

Fallback content is retained only as a temporary safety net while legacy production documents are normalized. Sanity fetch failures are logged. New required fields and dataset validation must be clean before fallback removal; this prevents a partially filled editor document from taking the public site offline.

## Deployment

The public Next.js app and embedded Studio are built separately. A deployment is complete only after both builds pass, the production dataset validates, the server service is active, and representative EN/RU/ZH routes are checked.