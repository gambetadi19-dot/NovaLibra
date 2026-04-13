import { test, expect } from '@playwright/test';

test('author can manage their catalog and view growth surfaces', async ({ page }) => {
  const uniqueTitle = `Stage Six Author Journey ${Date.now()}`;
  const updatedTitle = `${uniqueTitle} Revised`;

  await page.goto('/login');
  await page.getByLabel(/email/i).fill('author@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.goto('/my-books');
  await expect(page.getByRole('heading', { name: /publish a new title/i })).toBeVisible();

  await page.getByLabel(/title/i).fill(uniqueTitle);
  await page.getByLabel(/short description/i).fill('A polished short description created by the Stage 6 author browser journey.');
  await page.getByLabel(/full description/i).fill(
    'A detailed full description created by the Stage 6 author browser journey so we can verify real author publishing behavior.'
  );
  await page.getByLabel(/cover image url/i).fill('https://example.com/stage-six-author-journey.png');
  await page.getByLabel(/purchase url/i).fill('https://example.com/stage-six-author-journey');
  await page.getByRole('button', { name: /publish book/i }).click();

  await expect(page.getByText(uniqueTitle)).toBeVisible();

  const createdCard = page.locator('article').filter({ hasText: uniqueTitle }).first();
  await createdCard.getByRole('button', { name: /edit/i }).click();

  const titleInput = page.getByLabel(/title/i);
  await titleInput.fill(updatedTitle);
  await page.getByRole('button', { name: /update book/i }).click();

  await expect(page.getByText(updatedTitle)).toBeVisible();

  await page.goto('/author-analytics');
  await expect(page.getByRole('heading', { name: /see whether your presence is turning into momentum/i })).toBeVisible();
  await expect(page.getByText(/^followers$/i)).toBeVisible();

  await page.goto('/authors/2');
  await expect(page.getByRole('heading', { level: 1, name: /^amina dube$/i })).toBeVisible();
  await expect(page.getByRole('link', { name: updatedTitle })).toBeVisible();

  await page.goto('/my-books');
  await page.locator('article').filter({ hasText: updatedTitle }).first().getByRole('button', { name: /delete/i }).click();
  await expect(page.getByText(updatedTitle)).not.toBeVisible();
});
