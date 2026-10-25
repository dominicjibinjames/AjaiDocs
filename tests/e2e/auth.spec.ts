import { expect, test } from "@playwright/test";

test("rejects a wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill("alice@ajaia.dev");
  await page.getByTestId("login-password").fill("wrong-password");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("login-error")).toContainText("Invalid email or password");
});

test("sends an unauthenticated visitor to login", async ({ page }) => {
  await page.goto("/docs");
  await expect(page).toHaveURL(/\/login/);
});
