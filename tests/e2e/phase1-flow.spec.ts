import { expect, test } from "@playwright/test";

test("gradient atlas phase 1 flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Learn machine learning as a calm, navigable concept graph.",
    }),
  ).toBeVisible();

  await page.goto("/map");
  await expect(page).toHaveURL(/\/map$/);
  await expect(
    page.getByRole("heading", { name: "ML fundamentals map" }),
  ).toBeVisible();

  await page.goto("/learn/linear-regression");
  await expect(page).toHaveURL(/\/learn\/linear-regression$/);

  await page
    .getByRole("button", {
      name: /Logistic Regression\. Context concept\./i,
    })
    .click();

  await expect(page).toHaveURL(/\/learn\/logistic-regression$/);
  await expect(
    page.getByLabel("Concept detail view").getByRole("button", { name: "Understood" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Understood" }).click();
  await expect(
    page.getByLabel("Concept detail view").getByRole("button", { name: "Understood" }),
  ).toHaveClass(/bg-primary/);

  await page.getByRole("link", { name: "Studio" }).click();
  await expect(page).toHaveURL(/\/studio$/);

  await page.getByRole("button", { name: "Pack" }).click();
  await page.getByRole("button", { name: /ML Fundamentals/i }).click();
  await page.getByRole("button", { name: "Advanced tools" }).click();

  const exportPreview = page.locator("#studio-export");
  await expect(exportPreview).toContainText('"id": "ml-fundamentals"');

  const exportJson = await exportPreview.inputValue();
  const importedJson = exportJson.replace(
    '"title": "ML Fundamentals"',
    '"title": "Studio Import Demo"',
  );

  await page.locator("#studio-import").fill(importedJson);
  await page.getByRole("button", { name: "Import draft" }).click();

  await expect(
    page.getByText("Imported graph JSON into the local studio draft."),
  ).toBeVisible();
  await expect(page.locator("#graph-title")).toHaveValue("Studio Import Demo");
});
