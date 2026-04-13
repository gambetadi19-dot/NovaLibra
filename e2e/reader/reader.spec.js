import { test, expect } from '@playwright/test';

test('reader can move through the core reading loop', async ({ page }) => {
  const messageSubject = `Reader journey follow-up ${Date.now()}`;

  await page.goto('/login');
  await page.getByLabel(/email/i).fill('user@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { level: 1, name: /nomsa reader/i })).toBeVisible();

  await page.goto('/books/worlds-apart');
  await expect(page.getByRole('heading', { name: /worlds apart/i })).toBeVisible();

  const saveButton = page.getByRole('button', { name: /save book|saved/i });
  await saveButton.click();
  await expect(page.getByRole('button', { name: /save book|saved/i })).toBeVisible();

  const reviewBox = page.getByPlaceholder('What did this book do especially well for you as a reader?');
  await reviewBox.fill('This reader-driven Playwright review update proves the detailed feedback loop works end to end.');
  await page.getByRole('button', { name: /publish review|update review/i }).click();
  await expect(page.locator('article').filter({ hasText: 'This reader-driven Playwright review update proves the detailed feedback loop works end to end.' }).first()).toBeVisible();

  await page.getByPlaceholder('What stayed with you after reading about this book?').fill('This comment confirms the reader discussion path is working in the browser too.');
  await page.getByRole('button', { name: /^post$/i }).click();
  await expect(page.locator('[id^="comment-"]').filter({ hasText: 'This comment confirms the reader discussion path is working in the browser too.' }).first()).toBeVisible();

  await page.goto('/authors/2');
  await expect(page.getByRole('heading', { level: 1, name: /^amina dube$/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /follow author|following author/i })).toBeVisible();

  await page.goto('/messages');
  await expect(page.getByRole('heading', { name: /start a new note/i })).toBeVisible();
  await page.getByLabel(/recipient/i).selectOption('2');
  await page.getByPlaceholder('Book feedback, partnership idea, rights inquiry...').fill(messageSubject);
  await page.getByPlaceholder('Write your message...').fill('This browser-level message confirms the inbox flow works for a seeded reader account.');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.getByRole('heading', { name: new RegExp(messageSubject, 'i') })).toBeVisible();

  await page.goto('/notifications');
  await expect(page.getByRole('heading', { name: /realtime updates, presented with more calm and signal/i })).toBeVisible();
});
