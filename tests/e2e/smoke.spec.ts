import { expect, test } from "@playwright/test";

test("core user journey: onboarding -> dashboard -> simulator -> plan -> impact -> chat -> community", async ({
  page,
}) => {
  await page.goto("/");

  // 1. Onboarding appears for first-time user; load Demo Family in one tap
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /One-tap Demo Family/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  // 2. Dashboard shows Hero AQI and Cleanest Outdoor Window
  await expect(page.getByTestId("hero-aqi-value")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Cleanest Outdoor Window/i })).toBeVisible();

  // 3. Toggle Smog Simulator (~312 AQI Very Poor)
  await page.getByTestId("desktop-simulator-toggle").click();
  await expect(page.getByText(/Smog Simulator · AQI ~312/i).first()).toBeVisible();
  await expect(page.getByTestId("hero-aqi-value")).toHaveText("312", { timeout: 5000 });

  // 4. Open Today's Plan, check off an action, verify tally updates
  await page.getByRole("button", { name: /^Plan$/i }).click();
  await expect(page.getByRole("heading", { name: /Today's Action Plan/i })).toBeVisible();
  const firstCheck = page.locator('[data-testid^="action-check-"]').first();
  await firstCheck.click();
  await expect(page.getByTestId("protected-pm25-tally")).not.toHaveText("-0 µg/m³");

  // 5. Open Impact Explainer modal and verify before/after & Myth Buster
  await page.locator('[data-testid^="inspect-impact-"]').first().click();
  await expect(page.getByTestId("impact-before-after")).toBeVisible();
  await expect(page.getByText(/Myth Buster/i).first()).toBeVisible();
  await page.getByRole("button", { name: /Got it/i }).click();

  // 6. Ask Saans chat with suggested question
  await page.getByRole("button", { name: /^Ask$/i }).click();
  await page.getByRole("button", { name: /When is the best window/i }).click();
  await expect(page.getByText(/cleanest outdoor window/i).first()).toBeVisible({ timeout: 10000 });

  // 7. Community brief
  await page.getByRole("button", { name: /^Community$/i }).click();
  await expect(page.getByText(/3 Collective Neighbourhood Actions/i)).toBeVisible();
  await expect(page.getByTestId("copy-whatsapp-btn")).toBeVisible();
});
