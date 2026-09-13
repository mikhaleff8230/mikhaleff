import { expect, test } from "@playwright/test";

test("successful contact submission opens a prominent confirmation dialog", async ({ page }) => {
  await page.route("**/api/contact", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true }),
  }));
  await page.goto("/en/contact", { waitUntil: "domcontentloaded" });

  const form = page.locator(".contact-form").first();
  await form.locator('input[name="name"]').fill("Test visitor");
  await form.locator('input[name="email"]').fill("visitor@example.com");
  await form.locator('textarea[name="message"]').fill("This is a safe confirmation dialog test.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: /send message/i }).click();

  const dialog = page.getByRole("dialog", { name: "Message sent" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Your message has been delivered successfully.")).toBeVisible();
  await dialog.locator(".contact-success__action").click();
  await expect(dialog).toBeHidden();
});

test("artwork inquiry confirmation stays above the native inquiry dialog", async ({ page }) => {
  await page.route("**/api/contact", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true }),
  }));
  await page.goto("/en/works/untitled-026", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /inquire about this work/i }).click();

  const form = page.locator(".inquiry-dialog .contact-form");
  await form.locator('input[name="name"]').fill("Test visitor");
  await form.locator('input[name="email"]').fill("visitor@example.com");
  await form.locator('textarea[name="message"]').fill("This checks the confirmation top layer safely.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: /send message/i }).click();

  const success = page.locator(".contact-success");
  await expect(success).toBeVisible();
  const centerIsSuccess = await success.locator(".contact-success__dialog").evaluate((element) => {
    const box = element.getBoundingClientRect();
    return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest(".contact-success") !== null;
  });
  expect(centerIsSuccess).toBeTruthy();
});
