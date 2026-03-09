import { expect, test } from "@playwright/test";

test("gradient atlas phase 1 flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "A calm graph workspace for machine learning fundamentals",
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
      name: /Logistic Regression\. Related concept\./i,
    })
    .click();

  await expect(page).toHaveURL(/\/learn\/logistic-regression$/);
  await page.getByRole("button", { name: "Mark understood" }).click();
  await expect(page.getByText("understood", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Studio" }).click();
  await expect(page).toHaveURL(/\/studio$/);

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
