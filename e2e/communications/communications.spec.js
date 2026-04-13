import { expect, test } from '@playwright/test';

test('reader can consume announcements and use the messaging + notifications loop', async ({ page, request }) => {
  const uniqueAnnouncement = `Stage Ten Announcement ${Date.now()}`;
  const uniqueMessageSubject = `Stage 10 reader message ${Date.now()}`;

  const adminLoginResponse = await request.post('http://localhost:5000/api/auth/login', {
    data: {
      email: 'admin@example.com',
      password: 'password123'
    }
  });
  expect(adminLoginResponse.ok()).toBeTruthy();

  const adminSession = await adminLoginResponse.json();
  const createAnnouncementResponse = await request.post('http://localhost:5000/api/announcements', {
    headers: {
      authorization: `Bearer ${adminSession.accessToken}`
    },
    data: {
      title: uniqueAnnouncement,
      content: 'This announcement confirms the Stage 10 browser journey can consume a freshly published platform update.'
    }
  });
  expect(createAnnouncementResponse.ok()).toBeTruthy();

  const createdAnnouncement = await createAnnouncementResponse.json();

  try {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/profile$/);

    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: /realtime updates, presented with more calm and signal/i })).toBeVisible();
    const announcementNotification = page.getByRole('button', { name: new RegExp(uniqueAnnouncement, 'i') }).first();
    await expect(announcementNotification).toBeVisible();
    await announcementNotification.click();

    await expect(page).toHaveURL(new RegExp(`\\/\\?announcement=${createdAnnouncement.announcement.id}#announcements$`));
    await expect(page.locator('article').filter({ hasText: uniqueAnnouncement }).first()).toBeVisible();

    await page.goto('/messages');
    await expect(page.getByRole('heading', { name: /start a new note/i })).toBeVisible();
    await page.getByLabel(/recipient/i).selectOption('1');
    await page.getByPlaceholder('Book feedback, partnership idea, rights inquiry...').fill(uniqueMessageSubject);
    await page.getByPlaceholder('Write your message...').fill('This browser-level message confirms the communications milestone keeps inbox delivery healthy.');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByRole('heading', { name: new RegExp(uniqueMessageSubject, 'i') })).toBeVisible();
  } finally {
    await request.delete(`http://localhost:5000/api/announcements/${createdAnnouncement.announcement.id}`, {
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });
  }
});
