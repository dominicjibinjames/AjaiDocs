import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill("demo1234");
  await page.getByTestId("login-submit").click();
  await page.waitForURL(/\/docs$/);
  await expect(page.getByRole("heading", { name: "Documents", exact: true })).toBeVisible();
}

async function waitForDocumentSave(page: Page) {
  await page.waitForResponse(
    (response) =>
      response.url().includes("/api/documents/") &&
      response.request().method() === "PATCH" &&
      response.ok(),
  );
  await expect(page.getByTestId("save-status")).toHaveText("Saved");
}

test("create, format, persist, and share with an editor", async ({ page, browser }) => {
  await login(page, "alice@ajaia.dev");
  await page.getByTestId("new-document").click();
  await page.waitForURL(/\/docs\/.+/);

  const docTitle = `Launch notes ${Date.now()}`;
  const title = page.getByTestId("doc-title");
  const titleSave = waitForDocumentSave(page);
  await title.fill(docTitle);
  await title.blur();
  await titleSave;

  const editor = page.locator('[data-testid="editor"]');
  const bodySave = waitForDocumentSave(page);
  await editor.click();
  await page.keyboard.type("Hello AjaiDocs");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.getByRole("button", { name: "Bold" }).click();
  await bodySave;

  await page.reload();
  await expect(page.getByTestId("doc-title")).toHaveValue(docTitle);
  await expect(page.locator('[data-testid="editor"] strong, [data-testid="editor"] b')).toContainText(
    "Hello AjaiDocs",
  );

  await page.getByTestId("share-button").click();
  await page.getByTestId("share-email").fill("bob@ajaia.dev");
  await page.getByTestId("share-submit").click();
  await expect(page.getByText("Bob Rivera")).toBeVisible();

  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();
  await login(bobPage, "bob@ajaia.dev");
  await expect(bobPage.getByRole("heading", { name: "Shared with me" })).toBeVisible();
  await bobPage.getByRole("link", { name: new RegExp(docTitle) }).click();
  await expect(bobPage.getByTestId("doc-title")).toHaveValue(docTitle);
  await bobPage.locator('[data-testid="editor"]').click();
  await bobPage.keyboard.press("End");
  const bobSave = waitForDocumentSave(bobPage);
  await bobPage.keyboard.type(" — from Bob");
  await bobSave;
  await bobContext.close();
});

test("view-only users cannot use the editor", async ({ page }) => {
  await login(page, "carol@ajaia.dev");
  await page.getByRole("link", { name: /Welcome to AjaiDocs/ }).click();
  await page.waitForURL(/\/docs\/.+/);
  await expect(page.getByTestId("readonly-banner")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Bold" })).toBeDisabled();
});
