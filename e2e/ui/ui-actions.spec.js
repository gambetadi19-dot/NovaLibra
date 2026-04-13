import { expect, test } from '@playwright/test';

test('public navigation and CTA actions stay wired', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /^books$/i }).click();
  await expect(page).toHaveURL(/\/books$/);

  await page.getByRole('link', { name: /^create account$/i }).first().click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole('heading', { name: /create a literary profile that already feels established/i })).toBeVisible();

  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /open menu/i }).click();
  await expect(page.getByRole('link', { name: /^home$/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /^books$/i })).toBeVisible();
  await page.getByRole('link', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('protected navigation redirects guests to sign in', async ({ page }) => {
  await page.goto('/notifications');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /sign in to your novalibra account/i })).toBeVisible();

  await page.getByRole('link', { name: /create one/i }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test('author workspace action buttons stay functional in the browser', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('author@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/profile$/);

  await page.goto('/my-books');
  await expect(page.getByRole('heading', { name: /your published catalog/i })).toBeVisible();

  const firstViewLink = page.getByRole('link', { name: /view page/i }).first();
  await firstViewLink.click();
  await expect(page).toHaveURL(/\/books\//);

  await page.goto('/my-books');
  await page.getByRole('button', { name: /edit/i }).first().click();
  await expect(page.getByRole('button', { name: /cancel edit/i })).toBeVisible();
  await page.getByRole('button', { name: /cancel edit/i }).click();
  await expect(page.getByRole('button', { name: /publish book/i })).toBeVisible();
});
