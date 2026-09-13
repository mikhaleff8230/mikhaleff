# Sanity coverage

Status values: `IN_PROGRESS`, `BROKEN`, `PARTIAL`, `DONE`. All entries below were checked through schema → production document → GROQ → repository → type → renderer. Locale variants are EN/RU/ZH.

| Route pattern | CMS document/source | Blocks | Schema | Query | Frontend | Desktop/mobile | Smoke | Status |
|---|---|---:|---|---|---|---|---|---|
| `/` | redirect | 1/1 | N/A | N/A | OK | OK | OK | DONE |
| `/[locale]` | `homepage`, `siteSettings`, artworks, exhibitions, series | 6/6 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/works` | `archivePages.works`, artworks, materials | 4/4 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/works/[slug]` | artwork, material, series, exhibition, interiorScene | 9/9 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/collections` | `archivePages.collections`, series | 3/3 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/collections/[slug]` | series + referenced artworks | 5/5 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/exhibitions` | `archivePages.exhibitions`, exhibitions | 3/3 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/exhibitions/[slug]` | exhibition + referenced artworks | 6/6 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/about` | singleton `about` | 7/7 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/journal` | `archivePages.journal`, journal | 3/3 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/journal/[slug]` | journal | 4/4 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/contact` | singleton `contact` + `siteSettings` | 5/5 | OK | OK | OK | OK | OK | DONE |
| `/[locale]/series` | redirect to Collections | 1/1 | N/A | N/A | OK | OK | OK | DONE |
| `/[locale]/series/[slug]` | redirect to Collection | 1/1 | N/A | N/A | OK | OK | OK | DONE |

Automated smoke inventory is read from the production Sanity dataset and covers all published artwork, series, exhibition and journal slugs in EN/RU/ZH. Run `pnpm test:smoke` after `pnpm build`.