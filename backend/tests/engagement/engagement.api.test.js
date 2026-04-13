import { after, afterEach, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/db.js';
import { createReaderSession, jsonRequest, startServer, stopServer } from '../helpers/httpTestUtils.js';

describe('Reader engagement API coverage', () => {
  let server;
  let baseUrl;
  const createdUserIds = [];
  const transientReaderNames = [];

  before(async () => {
    const started = await startServer(app);
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    await stopServer(server);
  });

  afterEach(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds.splice(0, createdUserIds.length)
          }
        }
      });
    }

    const names = transientReaderNames.splice(0, transientReaderNames.length);
    for (const name of names) {
      await prisma.notification.deleteMany({
        where: {
          OR: [
            { message: { contains: name } },
            { title: { contains: name } }
          ]
        }
      });
    }
  });

  test('reader can save and unsave a book from the API', async () => {
    const reader = await createReaderSession(baseUrl, 'favorite');
    createdUserIds.push(reader.user.id);
    transientReaderNames.push(reader.name);

    const book = await prisma.book.findUnique({
      where: { slug: 'worlds-apart' },
      select: { id: true, authorId: true }
    });

    const favoriteResponse = await jsonRequest(baseUrl, `/api/favorites/${book.id}/toggle`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(favoriteResponse.status, 200);
    assert.equal(favoriteResponse.body.favorited, true);

    const notification = await prisma.notification.findFirst({
      where: {
        userId: book.authorId,
        type: 'SYSTEM',
        message: {
          contains: reader.name
        }
      }
    });

    assert.ok(notification);

    const unfavoriteResponse = await jsonRequest(baseUrl, `/api/favorites/${book.id}/toggle`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(unfavoriteResponse.status, 200);
    assert.equal(unfavoriteResponse.body.favorited, false);

    const favoriteCount = await prisma.favorite.count({
      where: {
        userId: reader.user.id,
        bookId: book.id
      }
    });

    assert.equal(favoriteCount, 0);
  });

  test('reader can create, edit, reply to, and delete comments', async () => {
    const reader = await createReaderSession(baseUrl, 'comments');
    createdUserIds.push(reader.user.id);
    transientReaderNames.push(reader.name);

    const book = await prisma.book.findUnique({
      where: { slug: 'worlds-apart' },
      select: { id: true }
    });
    const seededComment = await prisma.comment.findFirst({
      where: {
        bookId: book.id
      },
      orderBy: {
        id: 'asc'
      }
    });

    const createResponse = await jsonRequest(baseUrl, '/api/comments', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        bookId: book.id,
        content: 'This is a thoughtful test comment that proves the reader discussion flow is working.'
      }
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.comment.user.name, reader.name);

    const updateResponse = await jsonRequest(baseUrl, `/api/comments/${createResponse.body.comment.id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        content: 'This comment has been refined to verify the edit path as well.'
      }
    });

    assert.equal(updateResponse.status, 200);
    assert.match(updateResponse.body.comment.content, /refined/i);

    const replyResponse = await jsonRequest(baseUrl, `/api/comments/${seededComment.id}/replies`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        content: 'Joining the discussion with a reply that should notify the original commenter.'
      }
    });

    assert.equal(replyResponse.status, 201);
    assert.equal(replyResponse.body.reply.user.name, reader.name);

    const replyNotification = await prisma.notification.findFirst({
      where: {
        userId: seededComment.userId,
        type: 'COMMENT_REPLY',
        message: {
          contains: reader.name
        }
      }
    });

    assert.ok(replyNotification);

    const deleteResponse = await jsonRequest(baseUrl, `/api/comments/${createResponse.body.comment.id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.message, 'Comment deleted');
  });

  test('reader review flow upserts instead of duplicating and supports delete', async () => {
    const reader = await createReaderSession(baseUrl, 'reviews');
    createdUserIds.push(reader.user.id);
    transientReaderNames.push(reader.name);

    const book = await prisma.book.findUnique({
      where: { slug: 'the-first-cut' },
      select: { id: true, authorId: true }
    });

    const createResponse = await jsonRequest(baseUrl, '/api/reviews', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        bookId: book.id,
        rating: 5,
        content: 'This first review is long enough to satisfy validation while proving the create path works correctly.'
      }
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.review.rating, 5);

    const updateResponse = await jsonRequest(baseUrl, '/api/reviews', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        bookId: book.id,
        rating: 4,
        content: 'This updated review confirms NovaLibra keeps one review per reader and book combination.'
      }
    });

    assert.equal(updateResponse.status, 201);
    assert.equal(updateResponse.body.review.id, createResponse.body.review.id);
    assert.equal(updateResponse.body.review.rating, 4);

    const reviewCount = await prisma.review.count({
      where: {
        userId: reader.user.id,
        bookId: book.id
      }
    });

    assert.equal(reviewCount, 1);

    const reviewNotification = await prisma.notification.findFirst({
      where: {
        userId: book.authorId,
        type: 'REVIEW',
        message: {
          contains: reader.name
        }
      }
    });

    assert.ok(reviewNotification);

    const deleteResponse = await jsonRequest(baseUrl, `/api/reviews/${createResponse.body.review.id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.message, 'Review deleted');
  });

  test('reader can follow and unfollow an author profile', async () => {
    const reader = await createReaderSession(baseUrl, 'follows');
    createdUserIds.push(reader.user.id);
    transientReaderNames.push(reader.name);

    const author = await prisma.user.findUnique({
      where: { email: 'author@example.com' },
      select: { id: true }
    });

    const followResponse = await jsonRequest(baseUrl, `/api/follows/authors/${author.id}/toggle`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(followResponse.status, 200);
    assert.equal(followResponse.body.following, true);

    const followNotification = await prisma.notification.findFirst({
      where: {
        userId: author.id,
        type: 'FOLLOW',
        message: {
          contains: reader.name
        }
      }
    });

    assert.ok(followNotification);

    const unfollowResponse = await jsonRequest(baseUrl, `/api/follows/authors/${author.id}/toggle`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(unfollowResponse.status, 200);
    assert.equal(unfollowResponse.body.following, false);

    const followCount = await prisma.follow.count({
      where: {
        followerId: reader.user.id,
        followingId: author.id
      }
    });

    assert.equal(followCount, 0);
  });
});
