import { expect, test, type APIRequestContext } from "@playwright/test";

const locales = ["en", "ru", "zh"] as const;
const staticPaths = ["", "/works", "/collections", "/exhibitions", "/about", "/journal", "/contact", "/series"];

type SanityRoute = { _type: "artwork" | "series" | "exhibition" | "journal"; slug: string };

async function sanityRoutes(request: APIRequestContext): Promise<SanityRoute[]> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || "lqcc213n";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || "production";
  const query = `*[_type in ["artwork","series","exhibition","journal"] && defined(slug.current)]{_type,"slug":slug.current}`;
  const response = await request.get(`https://${projectId}.api.sanity.io/v2026-09-12/data/query/${dataset}?query=${encodeURIComponent(query)}`);
  expect(response.ok(), "Sanity route inventory request").toBeTruthy();
  const payload = await response.json() as { result: SanityRoute[] };
  expect(payload.result.length, "published dynamic Sanity routes").toBeGreaterThan(0);
  return payload.result;
}

function routeFor(item: SanityRoute) {
  if (item._type === "artwork") return `/works/${item.slug}`;
  if (item._type === "series") return `/collections/${item.slug}`;
  if (item._type === "exhibition") return `/exhibitions/${item.slug}`;
  return `/journal/${item.slug}`;
}

test("all public Sanity routes render without runtime or image errors", async ({ page, request }) => {
  const dynamic = await sanityRoutes(request);
  const paths = ["/", ...locales.flatMap((locale) => [
    ...staticPaths.map((path) => `/${locale}${path}`),
    ...dynamic.map((item) => `/${locale}${routeFor(item)}`),
    ...dynamic.filter((item) => item._type === "series").map((item) => `/${locale}/series/${item.slug}`),
  ])];
  const failures: string[] = [];

  for (const path of paths) {
    const errors: string[] = [];
    const onConsole = (message: { type(): string; text(): string }) => { if (message.type() === "error") errors.push(message.text()); };
    const onPageError = (error: Error) => errors.push(error.message);
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    if (!response || response.status() >= 400) errors.push(`HTTP ${response?.status() ?? "no response"}`);
    await page.waitForTimeout(350);
    const text = await page.locator("body").innerText().catch(() => "");
    if (!text.trim()) errors.push("empty body");
    if (text.includes("[SANITY MISSING]") || text.includes("undefined")) errors.push("missing CMS marker or undefined text");
    const brokenImages = await page.locator("img:visible").evaluateAll((images) => images.map((image) => image as HTMLImageElement).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.getAttribute("src") || "unknown"));
    if (brokenImages.length) errors.push(`broken images: ${brokenImages.join(", ")}`);
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    if (errors.length) failures.push(`${path}: ${errors.join(" | ")}`);
  }

  expect(failures, failures.join("\n")).toEqual([]);
});