import { expect, test } from '@playwright/test';

test('reader can move through the full engagement loop on a book and author profile', async ({ page }) => {
  const uniqueComment = `Stage Nine Comment ${Date.now()}`;

  await page.goto('/login');
  await page.getByLabel(/email/i).fill('user@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.goto('/books/worlds-apart');
  await expect(page.getByRole('heading', { name: /worlds apart/i })).toBeVisible();

  const saveButton = page.getByRole('button', { name: /save book|saved/i });
  const initialSaveLabel = await saveButton.innerText();
  await saveButton.click();
  await expect(page.getByRole('button', { name: initialSaveLabel === 'Saved' ? /save book/i : /saved/i })).toBeVisible();
  await page.getByRole('button', { name: initialSaveLabel === 'Saved' ? /save book/i : /saved/i }).click();
  await expect(page.getByRole('button', { name: new RegExp(`^${initialSaveLabel}$`, 'i') })).toBeVisible();

  const reviewBox = page.getByPlaceholder('What did this book do especially well for you as a reader?');
  await reviewBox.fill('This Stage 9 browser review proves the engagement system works from save to review to discussion.');
  await page.getByRole('button', { name: /publish review|update review/i }).click();
  await expect(page.locator('article').filter({ hasText: 'This Stage 9 browser review proves the engagement system works from save to review to discussion.' }).first()).toBeVisible();

  await page.getByPlaceholder('What stayed with you after reading about this book?').fill(uniqueComment);
  await page.getByRole('button', { name: /^post$/i }).click();
  const createdComment = page.locator('[id^="comment-"]').filter({ hasText: uniqueComment }).first();
  await expect(createdComment).toBeVisible();
  await createdComment.getByRole('button', { name: /delete/i }).click();
  await expect(page.locator('[id^="comment-"]').filter({ hasText: uniqueComment })).toHaveCount(0);

  await page.goto('/authors/2');
  await expect(page.getByRole('heading', { level: 1, name: /^amina dube$/i })).toBeVisible();
  const followButton = page.getByRole('button', { name: /follow author|following author/i });
  const initialFollowLabel = await followButton.innerText();
  await followButton.click();
  await expect(page.getByRole('button', { name: initialFollowLabel === 'Following author' ? /follow author/i : /following author/i })).toBeVisible();
  await page.getByRole('button', { name: initialFollowLabel === 'Following author' ? /follow author/i : /following author/i }).click();
  await expect(page.getByRole('button', { name: new RegExp(`^${initialFollowLabel}$`, 'i') })).toBeVisible();
});
