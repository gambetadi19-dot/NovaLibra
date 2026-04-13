import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { app } from '../../src/app.js';
import { startServer, stopServer, loginAs, jsonRequest } from '../helpers/httpTestUtils.js';

const uniqueSuffix = Date.now();

describe('Admin API stage 7', () => {
  let server;
  let baseUrl;
  let adminSession;
  let readerSession;
  let authorUser;
  let createdAnnouncementId;
  let createdBookId;

  before(async () => {
    ({ server, baseUrl } = await startServer(app));
    adminSession = await loginAs(baseUrl, 'admin@example.com');
    readerSession = await loginAs(baseUrl, 'user@example.com');

    const usersResponse = await jsonRequest(baseUrl, '/api/admin/users', {
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(usersResponse.status, 200);
    authorUser = usersResponse.body.users.find((user) => user.role === 'AUTHOR');
    assert.ok(authorUser, 'Expected a seeded author user for admin tests');
  });

  after(async () => {
    if (createdBookId) {
      await jsonRequest(baseUrl, `/api/books/${createdBookId}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${adminSession.accessToken}`
        }
      }).catch(() => {});
    }

    if (createdAnnouncementId) {
      await jsonRequest(baseUrl, `/api/announcements/${createdAnnouncementId}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${adminSession.accessToken}`
        }
      }).catch(() => {});
    }

    await stopServer(server);
  });

  test('admin dashboard returns platform stats and activity', async () => {
    const response = await jsonRequest(baseUrl, '/api/admin/dashboard', {
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(response.body.stats.totalUsers >= 3);
    assert.ok(Array.isArray(response.body.activity.recentUsers));
    assert.ok(Array.isArray(response.body.activity.topBooks));
  });

  test('non-admin users are blocked from the admin dashboard', async () => {
    const response = await jsonRequest(baseUrl, '/api/admin/dashboard', {
      headers: {
        authorization: `Bearer ${readerSession.accessToken}`
      }
    });

    assert.equal(response.status, 403);
  });

  test('admin can inspect users and toggle featured author state', async () => {
    const beforeToggle = await jsonRequest(baseUrl, `/api/admin/users/${authorUser.id}/feature-author`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(beforeToggle.status, 200);
    assert.equal(beforeToggle.body.success, true);
    assert.equal(beforeToggle.body.user.id, authorUser.id);

    const afterToggle = await jsonRequest(baseUrl, `/api/admin/users/${authorUser.id}/feature-author`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(afterToggle.status, 200);
    assert.notEqual(beforeToggle.body.user.isFeaturedAuthor, afterToggle.body.user.isFeaturedAuthor);
  });

  test('admin comments view returns moderation queue data', async () => {
    const response = await jsonRequest(baseUrl, '/api/admin/comments', {
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.comments));
    assert.ok(response.body.comments.length >= 1);
    assert.ok(response.body.comments[0].user);
    assert.ok(response.body.comments[0].book);
  });

  test('admin can create, update, and delete announcements', async () => {
    const createResponse = await jsonRequest(baseUrl, '/api/announcements', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      },
      body: {
        title: `Stage 7 Announcement ${uniqueSuffix}`,
        content: 'This announcement is created by the Stage 7 admin API suite to verify editorial publishing controls.'
      }
    });

    assert.equal(createResponse.status, 201);
    createdAnnouncementId = createResponse.body.announcement.id;

    const updateResponse = await jsonRequest(baseUrl, `/api/announcements/${createdAnnouncementId}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      },
      body: {
        title: `Stage 7 Announcement ${uniqueSuffix} Updated`,
        content: 'This updated announcement verifies that admins can refine a published platform update from the API layer.'
      }
    });

    assert.equal(updateResponse.status, 200);
    assert.match(updateResponse.body.announcement.title, /Updated/);

    const deleteResponse = await jsonRequest(baseUrl, `/api/announcements/${createdAnnouncementId}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(deleteResponse.status, 200);
    createdAnnouncementId = null;
  });

  test('admin can create, update featured state, and delete books', async () => {
    const createResponse = await jsonRequest(baseUrl, '/api/books', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      },
      body: {
        title: `Stage 7 Admin Book ${uniqueSuffix}`,
        genre: 'Fantasy',
        category: 'Fiction',
        isFeatured: true,
        shortDescription: 'A concise editorial description created by the admin Stage 7 suite.',
        fullDescription:
          'A longer editorial description created by the admin Stage 7 suite so we can verify admin catalog ownership, validation, and featured-book controls.',
        coverImage: 'https://example.com/stage-seven-admin-book.png',
        amazonUrl: 'https://example.com/stage-seven-admin-book'
      }
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.book.isFeatured, true);
    createdBookId = createResponse.body.book.id;

    const updateResponse = await jsonRequest(baseUrl, `/api/books/${createdBookId}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      },
      body: {
        title: `Stage 7 Admin Book ${uniqueSuffix} Updated`,
        genre: 'Fantasy',
        category: 'Curated',
        isFeatured: false,
        shortDescription: 'An updated editorial description created by the admin Stage 7 suite.',
        fullDescription:
          'An updated long-form description created by the admin Stage 7 suite so we can verify admin catalog editing and featured-state updates.',
        coverImage: 'https://example.com/stage-seven-admin-book-updated.png',
        amazonUrl: 'https://example.com/stage-seven-admin-book-updated'
      }
    });

    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.book.isFeatured, false);
    assert.match(updateResponse.body.book.title, /Updated/);

    const deleteResponse = await jsonRequest(baseUrl, `/api/books/${createdBookId}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(deleteResponse.status, 200);
    createdBookId = null;
  });

  test('admin inbox can see platform messages and reply to members', async () => {
    const listResponse = await jsonRequest(baseUrl, '/api/messages', {
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      }
    });

    assert.equal(listResponse.status, 200);
    assert.ok(Array.isArray(listResponse.body.messages));
    assert.ok(listResponse.body.messages.length >= 1);

    const targetMessage = listResponse.body.messages.find((message) => message.sender?.role !== 'ADMIN');
    assert.ok(targetMessage, 'Expected at least one inbound non-admin message');

    const replyResponse = await jsonRequest(baseUrl, '/api/messages', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${adminSession.accessToken}`
      },
      body: {
        receiverId: targetMessage.senderId,
        subject: `Stage 7 Admin Reply ${uniqueSuffix}`,
        content: 'This admin reply verifies that the platform team can answer a member from the admin inbox.'
      }
    });

    assert.equal(replyResponse.status, 201);
    assert.equal(replyResponse.body.message.senderId, adminSession.user.id);
    assert.equal(replyResponse.body.message.receiverId, targetMessage.senderId);
  });
});
