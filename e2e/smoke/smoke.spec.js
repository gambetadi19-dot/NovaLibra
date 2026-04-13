import { test, expect } from '@playwright/test';

test('homepage loads and shows NovaLibra branding', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/NovaLibra/i);
  await expect(page.getByRole('banner').getByRole('link', { name: /NovaLibra logo/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /explore books/i })).toBeVisible();
});

test('books route opens for public visitors', async ({ page }) => {
  await page.goto('/books');
  await expect(page.getByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeVisible();
  await expect(
    page
      .getByRole('heading', { name: /no books in the catalog/i })
      .or(page.getByRole('link', { name: /view details/i }).first())
  ).toBeVisible();
});

test('login route opens for public visitors', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /sign in to your novalibra account/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeEnabled();
});
