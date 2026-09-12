# Sanity CMS release checklist

## Schema and Studio

- [x] Studio grouped as SITE / PAGES / ART / CONTENT.
- [x] Homepage, About, Contact, Archive Pages, and Global settings behave as singletons.
- [x] Reusable localized/image/SEO objects are used.
- [x] Artwork image roles are named and documented.
- [x] Legacy image/relation fields are preserved read-only.
- [x] Interior scenes are global.
- [x] Conditional price and video fields are defined.
- [x] Useful artwork/collection/exhibition previews are configured.

## Data integrity

- [x] Detail and texture arrays use `imageWithMetadata`.
- [x] Existing invalid raw `image` array members were migrated.
- [x] Artwork primary/detail images retain source dimensions in GROQ.
- [x] View in Space uses current global scene documents.
- [x] Homepage Hero and Statement use separate independent images.
- [x] Collection membership has one active source (`Artwork.series`).
- [x] Exhibition membership has one active source (`Artwork.exhibitions`).
- [ ] Remove legacy fields only after a separately approved backup/cleanup migration.

## Queries and types

- [x] Active GROQ queries are centralized in `lib/sanity/queries.ts`.
- [x] Active queries use `defineQuery`.
- [x] Sanity schema extraction is configured in `sanity.cli.ts`.
- [x] TypeGen generates `sanity.types.ts`.
- [x] Generated query results are used at the repository boundary.
- [x] `pnpm typecheck` passes.

## Archive pages

- [x] Works, Collections, Exhibitions, and Journal introductions are localized Sanity content.
- [x] Their metadata reads per-page Sanity SEO with safe content fallbacks.
- [x] Works Hero image is replaceable in Sanity.

## Homepage

- [x] Hero accepts any image independently of Artwork.
- [x] Statement accepts its own image and never copies Hero.
- [x] Exhibitions block accepts its own image.
- [x] Homepage editorial labels, notes, and contact CTA have localized fields.
- [x] Existing production Homepage content was initialized without overwriting editor values.

## Artwork page

- [x] Primary image uses contain and opens fullscreen viewer.
- [x] Detail thumbnails change the opening gallery image.
- [x] Detail/texture images preserve their own aspect ratios.
- [x] Detail images open in the fullscreen viewer.
- [x] Interior preview is visually cropped only where the design explicitly calls for it.
- [x] Mobile interior-scene image is respected.
- [x] Price/currency/show-price fields reach the frontend.

## Before every deploy

- [ ] Run `pnpm sanity:typegen`.
- [ ] Run `npx sanity documents validate --dataset production --format pretty`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm studio:build`.
- [ ] Test Homepage and one Artwork in EN, RU, ZH.
- [ ] Test portrait, landscape, square, and unusual artwork ratios.
- [ ] Test image replacement after publishing (not only draft state).
- [ ] Test View in Space desktop and mobile scene images.
- [ ] Check browser console and failed network requests.
- [ ] Push the reviewed commit, deploy app and Studio, then verify the server service.