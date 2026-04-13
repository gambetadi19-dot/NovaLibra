import { expect, test } from '@playwright/test';

test('public seeded content makes the homepage and discovery views feel demo-ready', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /a literary home/i })).toBeVisible();
  await expect(page.getByText(/new reader community launch/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /worlds apart/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /amina dube/i })).toBeVisible();

  await page.goto('/books');
  await expect(page.getByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /margaret hamata: a woman of courage/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /the first cut/i }).first()).toBeVisible();
});

test('seeded reader account lands in a populated experience', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('user@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: /nomsa reader/i })).toBeVisible();
  await expect(page.getByText('Worlds Apart').first()).toBeVisible();

  await page.goto('/notifications');
  await expect(page.getByText(/welcome to the platform/i)).toBeVisible();
  await expect(page.getByText(/new reader community launch/i)).toBeVisible();

  await page.goto('/messages');
  await expect(page.getByRole('heading', { name: /your recent correspondence/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^book club invitation$/i })).toBeVisible();
});

test('seeded author and admin accounts both open into meaningful workspaces', async ({ browser }) => {
  const authorPage = await browser.newPage();

  await authorPage.goto('http://localhost:5173/login');
  await authorPage.getByLabel(/email/i).fill('author@example.com');
  await authorPage.getByLabel(/password/i).fill('password123');
  await authorPage.getByRole('button', { name: /sign in/i }).click();
  await expect(authorPage).toHaveURL(/\/profile$/);

  await authorPage.goto('http://localhost:5173/my-books');
  await expect(authorPage.getByRole('heading', { name: /your published catalog/i })).toBeVisible();
  await expect(authorPage.getByRole('link', { name: /view page/i }).first()).toBeVisible();
  await expect(authorPage.getByText('Worlds Apart').last()).toBeVisible();

  await authorPage.goto('http://localhost:5173/author-analytics');
  await expect(authorPage.getByRole('heading', { name: /see whether your presence is turning into momentum/i })).toBeVisible();
  await expect(authorPage.getByText(/followers/i).first()).toBeVisible();

  await authorPage.close();

  const adminPage = await browser.newPage();

  await adminPage.goto('http://localhost:5173/login');
  await adminPage.getByLabel(/email/i).fill('admin@example.com');
  await adminPage.getByLabel(/password/i).fill('password123');
  await adminPage.getByRole('button', { name: /sign in/i }).click();
  await expect(adminPage).toHaveURL(/\/profile$/);

  await adminPage.goto('http://localhost:5173/admin');
  await expect(adminPage.getByRole('heading', { name: /run novalibra from a calmer, more premium control room/i })).toBeVisible();
  await expect(adminPage.getByText(/members/i).first()).toBeVisible();

  await adminPage.goto('http://localhost:5173/admin/messages');
  await expect(adminPage.getByRole('heading', { name: /review platform messages from a more composed support desk/i })).toBeVisible();

  await adminPage.close();
});
