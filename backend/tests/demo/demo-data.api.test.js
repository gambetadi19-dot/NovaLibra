import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/app.js';
import { jsonRequest, loginAs, startServer, stopServer } from '../helpers/httpTestUtils.js';

describe('Seeded demo data API coverage', () => {
  let server;
  let baseUrl;

  before(async () => {
    const started = await startServer(app);
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    await stopServer(server);
  });

  test('seeded admin, author, and reader accounts can all log in with the expected roles', async () => {
    const [admin, author, reader] = await Promise.all([
      loginAs(baseUrl, 'admin@example.com'),
      loginAs(baseUrl, 'author@example.com'),
      loginAs(baseUrl, 'user@example.com')
    ]);

    assert.equal(admin.user.role, 'ADMIN');
    assert.equal(author.user.role, 'AUTHOR');
    assert.equal(reader.user.role, 'READER');
    assert.equal(admin.user.name, 'NovaLibra Admin');
    assert.equal(author.user.name, 'Amina Dube');
    assert.equal(reader.user.name, 'Nomsa Reader');
  });

  test('seeded public catalog and homepage discovery surfaces are populated', async () => {
    const [booksResponse, authorsResponse, announcementsResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/books'),
      jsonRequest(baseUrl, '/api/users/authors?featured=true'),
      jsonRequest(baseUrl, '/api/announcements')
    ]);

    assert.equal(booksResponse.status, 200);
    assert.ok(booksResponse.body.books.some((book) => book.slug === 'worlds-apart'));
    assert.ok(booksResponse.body.books.some((book) => book.slug === 'margaret-hamata-a-woman-of-courage'));
    assert.ok(booksResponse.body.books.some((book) => book.slug === 'the-first-cut'));

    assert.equal(authorsResponse.status, 200);
    assert.ok(authorsResponse.body.authors.some((author) => author.name === 'Amina Dube'));

    assert.equal(announcementsResponse.status, 200);
    assert.ok(announcementsResponse.body.announcements.some((announcement) => announcement.title === 'New Reader Community Launch'));
  });

  test('seeded book detail carries discussion, review, and author data for demos', async () => {
    const response = await jsonRequest(baseUrl, '/api/books/worlds-apart');

    assert.equal(response.status, 200);
    assert.equal(response.body.book.title, 'Worlds Apart');
    assert.equal(response.body.book.author.name, 'Amina Dube');
    assert.ok(response.body.book.comments.length >= 1);
    assert.ok(response.body.book.reviews.length >= 1);
    assert.ok(response.body.book.comments.some((comment) => /family dynamics/i.test(comment.content)));
    assert.ok(response.body.book.comments.some((comment) => comment.replies.length >= 1));
  });

  test('seeded reader profile is rich enough for walkthroughs', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');

    const profileResponse = await jsonRequest(baseUrl, '/api/users/me/profile', {
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(profileResponse.status, 200);
    assert.equal(profileResponse.body.profile.name, 'Nomsa Reader');
    assert.ok(profileResponse.body.profile.favorites.length >= 1);
    assert.ok(profileResponse.body.profile.followingAuthors.length >= 1);
    assert.ok(profileResponse.body.profile.reviews.length >= 1);
    assert.ok(profileResponse.body.profile.comments.length >= 1);
  });

  test('seeded author and admin workspaces already have meaningful data', async () => {
    const [author, admin] = await Promise.all([
      loginAs(baseUrl, 'author@example.com'),
      loginAs(baseUrl, 'admin@example.com')
    ]);

    const [myBooksResponse, analyticsResponse, dashboardResponse, messagesResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/users/me/books', {
        headers: {
          authorization: `Bearer ${author.accessToken}`
        }
      }),
      jsonRequest(baseUrl, '/api/users/me/analytics', {
        headers: {
          authorization: `Bearer ${author.accessToken}`
        }
      }),
      jsonRequest(baseUrl, '/api/admin/dashboard', {
        headers: {
          authorization: `Bearer ${admin.accessToken}`
        }
      }),
      jsonRequest(baseUrl, '/api/messages', {
        headers: {
          authorization: `Bearer ${admin.accessToken}`
        }
      })
    ]);

    assert.equal(myBooksResponse.status, 200);
    assert.ok(myBooksResponse.body.books.length >= 3);

    assert.equal(analyticsResponse.status, 200);
    assert.ok(analyticsResponse.body.analytics.totalBooks >= 3);
    assert.ok(analyticsResponse.body.analytics.followerCount >= 1);

    assert.equal(dashboardResponse.status, 200);
    assert.ok(dashboardResponse.body.stats.totalUsers >= 4);
    assert.ok(dashboardResponse.body.stats.totalBooks >= 3);
    assert.ok(dashboardResponse.body.stats.totalMessages >= 1);

    assert.equal(messagesResponse.status, 200);
    assert.ok(messagesResponse.body.messages.length >= 1);
  });

  test('seeded notifications and message inboxes exist for reader demos', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');

    const [notificationsResponse, messagesResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/notifications', {
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        }
      }),
      jsonRequest(baseUrl, '/api/messages', {
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        }
      })
    ]);

    assert.equal(notificationsResponse.status, 200);
    assert.ok(notificationsResponse.body.notifications.some((notification) => notification.title === 'Welcome to the platform'));
    assert.ok(notificationsResponse.body.notifications.some((notification) => notification.type === 'ANNOUNCEMENT'));

    assert.equal(messagesResponse.status, 200);
    assert.ok(messagesResponse.body.messages.some((message) => /book club invitation/i.test(message.subject || '')));
  });
});
