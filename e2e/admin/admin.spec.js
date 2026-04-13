import { expect, test } from '@playwright/test';

test('admin can operate the control surfaces that matter most', async ({ page }) => {
  const uniqueAnnouncement = `Stage Seven Announcement ${Date.now()}`;

  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /run novalibra from a calmer, more premium control room/i })).toBeVisible();
  await page.getByRole('link', { name: /manage books/i }).click();
  await expect(page).toHaveURL(/\/admin\/books$/);
  await expect(page.getByRole('heading', { name: /add a new book to the catalog/i })).toBeVisible();

  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: /see who is shaping the platform/i })).toBeVisible();
  const featureButton = page.getByRole('button', { name: /^feature author$|^featured author$/i }).first();
  const buttonName = (await featureButton.innerText()).trim();
  await featureButton.click();
  await expect(page.getByRole('button', { name: buttonName === 'Feature author' ? /^featured author$/i : /^feature author$/i }).first()).toBeVisible();
  await page.getByRole('button', { name: buttonName === 'Feature author' ? /^featured author$/i : /^feature author$/i }).first().click();
  await expect(page.getByRole('button', { name: new RegExp(`^${buttonName}$`, 'i') }).first()).toBeVisible();

  await page.goto('/admin/announcements');
  await expect(page.getByRole('heading', { name: /publish a new announcement/i })).toBeVisible();
  await page.getByLabel(/title/i).fill(uniqueAnnouncement);
  await page.getByLabel(/content/i).fill('This announcement verifies that the admin browser journey can publish a platform update and clean it up afterward.');
  await page.getByRole('button', { name: /^publish$/i }).click();
  const createdAnnouncement = page.locator('article').filter({ hasText: uniqueAnnouncement }).first();
  await expect(createdAnnouncement).toBeVisible();
  await createdAnnouncement.getByRole('button', { name: /^delete$/i }).click();
  await expect(page.locator('article').filter({ hasText: uniqueAnnouncement })).toHaveCount(0);

  await page.goto('/admin/messages');
  await expect(page.getByRole('heading', { name: /review platform messages from a more composed support desk/i })).toBeVisible();
  await expect(page.getByText(/messages loaded/i)).toBeVisible();
});
