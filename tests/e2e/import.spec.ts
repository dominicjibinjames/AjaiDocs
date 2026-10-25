import { expect, test } from "@playwright/test";
import path from "path";
import { writeFileSync, mkdirSync } from "fs";

test("imports a markdown file into a new document", async ({ page }) => {
  const fixtureDir = path.join(process.cwd(), "test-results", "fixtures");
  mkdirSync(fixtureDir, { recursive: true });
  const filePath = path.join(fixtureDir, "imported-notes.md");
  writeFileSync(filePath, "# Imported heading\n\n- alpha\n- beta\n");

  await page.goto("/login");
  await page.getByTestId("login-email").fill("alice@ajaia.dev");
  await page.getByTestId("login-password").fill("demo1234");
  await page.getByTestId("login-submit").click();
  await page.waitForURL(/\/docs$/);

  await page.getByTestId("import-open").click();
  await page.getByTestId("import-input").setInputFiles(filePath);
  await page.waitForURL(/\/docs\/.+/);
  await expect(page.getByTestId("doc-title")).toHaveValue("imported-notes");
  await expect(page.locator('[data-testid="editor"] h1')).toContainText("Imported heading");
});

test("rejects an unsupported file type in the UI", async ({ page }) => {
  const fixtureDir = path.join(process.cwd(), "test-results", "fixtures");
  mkdirSync(fixtureDir, { recursive: true });
  const filePath = path.join(fixtureDir, "notes.pdf");
  writeFileSync(filePath, "%PDF-1.4");

  await page.goto("/login");
  await page.getByTestId("login-email").fill("alice@ajaia.dev");
  await page.getByTestId("login-password").fill("demo1234");
  await page.getByTestId("login-submit").click();
  await page.waitForURL(/\/docs$/);

  await page.getByTestId("import-open").click();
  await page.getByTestId("import-input").setInputFiles(filePath);
  await expect(page.getByTestId("import-error")).toContainText("Only .txt, .md, and .docx");
});
