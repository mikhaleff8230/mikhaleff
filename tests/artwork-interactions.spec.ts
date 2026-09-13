import { expect, test } from "@playwright/test";

test("artwork video, zoom pan, View in Space and exhibition rendering work", async ({ page }, testInfo) => {
  await page.goto("/en/works/untitled-026", { waitUntil: "domcontentloaded" });

  const video = page.locator(".artwork-video video");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((element) => ({ width: (element as HTMLVideoElement).videoWidth, height: (element as HTMLVideoElement).videoHeight }))).toEqual({ width: 1920, height: 1080 });
  await video.evaluate(async (element) => { const video = element as HTMLVideoElement; video.muted = true; await video.play(); });
  const startTime = await video.evaluate((element) => (element as HTMLVideoElement).currentTime);
  await page.waitForTimeout(1_200);
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(startTime);
  await expect(video).toHaveCSS("object-fit", "contain");

  await page.locator(".artwork-open").click();
  await expect(page.locator(".viewer")).toBeVisible();
  await page.locator(".viewer__controls button").first().click();
  await page.locator(".viewer__controls button").first().click();
  const canvas = page.locator(".viewer__canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 70, { steps: 5 });
    await page.mouse.up();
  }
  await expect(page.locator(".viewer__image")).not.toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page.locator(".viewer__top button").click();

  const space = page.locator(".view-in-space-preview");
  await space.scrollIntoViewIfNeeded();
  await space.click();
  await expect(page.locator(".space-modal")).toBeVisible();
  await expect.poll(() => page.locator(".space-modal__canvas canvas").first().evaluate((element) => ({ width: (element as HTMLCanvasElement).width, height: (element as HTMLCanvasElement).height }))).toMatchObject({ width: expect.any(Number), height: expect.any(Number) });
  const canvasSize = await page.locator(".space-modal__canvas canvas").first().evaluate((element) => ({ width: (element as HTMLCanvasElement).width, height: (element as HTMLCanvasElement).height }));
  expect(canvasSize.width).toBeGreaterThan(250);
  expect(canvasSize.height).toBeGreaterThan(testInfo.project.name.includes("mobile") ? 200 : 300);
  await page.locator(".space-modal > header button").last().click();

  await page.goto("/en/works", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Exhibition", exact: true }).click();
  await expect(page.locator(".exhibition-work")).toHaveCount(13);
  const exhibitionImages = page.locator(".exhibition-work__image img");
  await expect(exhibitionImages.first()).toHaveCSS("object-fit", "contain");
});