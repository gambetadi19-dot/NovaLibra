import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../src/config/db.js';

describe('Seed sanity', () => {
  test('database is reachable and seeded demo data exists', async () => {
    const [userCount, bookCount, commentCount, announcementCount, messageCount, notificationCount] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.comment.count(),
      prisma.announcement.count(),
      prisma.message.count(),
      prisma.notification.count()
    ]);

    assert.ok(userCount >= 3, `Expected at least 3 seeded users, received ${userCount}`);
    assert.ok(bookCount >= 3, `Expected at least 3 seeded books, received ${bookCount}`);
    assert.ok(commentCount >= 1, `Expected at least 1 seeded comment, received ${commentCount}`);
    assert.ok(announcementCount >= 1, `Expected at least 1 seeded announcement, received ${announcementCount}`);
    assert.ok(messageCount >= 1, `Expected at least 1 seeded message, received ${messageCount}`);
    assert.ok(notificationCount >= 1, `Expected at least 1 seeded notification, received ${notificationCount}`);
  });
});
