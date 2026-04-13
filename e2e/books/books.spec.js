import { expect, test } from '@playwright/test';

test('public visitor can filter the catalog and open the matching book detail page', async ({ page }) => {
  await page.goto('/books');
  await expect(page.getByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeVisible();

  await page.getByLabel(/search/i).fill('Margaret');
  await expect(page.getByRole('heading', { name: /margaret hamata/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /worlds apart/i })).toHaveCount(0);

  await page.getByLabel(/genre/i).selectOption('Historical Fiction');
  await page.getByLabel(/category/i).selectOption('Women of Courage');
  await page.getByLabel(/show only featured placements/i).check();

  const matchingCard = page.locator('article').filter({ hasText: 'Margaret Hamata: A Woman of Courage' }).first();
  await expect(matchingCard).toBeVisible();
  await matchingCard.getByRole('link', { name: /view details/i }).click();

  await expect(page).toHaveURL(/\/books\/margaret-hamata-a-woman-of-courage$/);
  await expect(page.getByRole('heading', { level: 1, name: /margaret hamata/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /buy on amazon/i })).toBeVisible();
});

test('public visitor sees a safe empty-state path for unmatched catalog filters', async ({ page }) => {
  await page.goto('/books');
  await page.getByLabel(/search/i).fill('NoSuchNovaLibraBook');
  await expect(page.getByRole('heading', { name: /no books in the catalog/i })).toBeVisible();

  await page.getByRole('button', { name: /reset filters/i }).click();
  await expect(page.getByRole('heading', { name: /worlds apart/i }).first()).toBeVisible();
});
