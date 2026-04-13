import { test, expect } from '@playwright/test';

test('public visitor can browse from home to books and into a book detail page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /a literary home/i })).toBeVisible();

  await page.getByRole('link', { name: /explore books/i }).click();
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeVisible();

  await page.getByRole('link', { name: /view details/i }).first().click();
  await expect(page).toHaveURL(/\/books\//);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /buy on amazon/i })).toBeVisible();
});

test('public visitor can open an author profile from a book detail page', async ({ page }) => {
  await page.goto('/books/worlds-apart');
  await expect(page.getByRole('heading', { name: /worlds apart/i })).toBeVisible();

  await page.getByRole('link', { name: /by amina dube/i }).click();
  await expect(page).toHaveURL(/\/authors\/2$/);
  await expect(page.getByRole('heading', { level: 1, name: /^amina dube$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /books by amina dube/i })).toBeVisible();
});

test('public visitor gets a safe not-found experience for unknown routes', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('heading', { name: /this page is not in the catalog/i })).toBeVisible();
  await page.getByRole('link', { name: /return home/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
