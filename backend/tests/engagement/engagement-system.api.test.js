import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../src/config/db.js';
import { app } from '../../src/app.js';
import { createReaderSession, jsonRequest, loginAs, startServer, stopServer } from '../helpers/httpTestUtils.js';

describe('Engagement system rules', () => {
  let server;
  let baseUrl;
  const createdUserIds = [];
  const transientNames = [];

  before(async () => {
    ({ server, baseUrl } = await startServer(app));
  });

  after(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds
          }
        }
      });
    }

    for (const name of transientNames) {
      await prisma.notification.deleteMany({
        where: {
          OR: [{ title: { contains: name } }, { message: { contains: name } }]
        }
      });
    }

    await stopServer(server);
  });

  test('favorites reject missing books with a safe 404', async () => {
    const reader = await createReaderSession(baseUrl, 'fav404');
    createdUserIds.push(reader.user.id);
    transientNames.push(reader.name);

    const response = await jsonRequest(baseUrl, '/api/favorites/999999/toggle', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, 'Book not found');
  });

  test('comment creation rejects a missing book and reply creation rejects a missing comment', async () => {
    const reader = await createReaderSession(baseUrl, 'comment404');
    createdUserIds.push(reader.user.id);
    transientNames.push(reader.name);

    const [commentResponse, replyResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/comments', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        },
        body: {
          bookId: 999999,
          content: 'Trying to comment on a book that does not exist should fail cleanly.'
        }
      }),
      jsonRequest(baseUrl, '/api/comments/999999/replies', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        },
        body: {
          content: 'Trying to reply to a missing comment should also fail cleanly.'
        }
      })
    ]);

    assert.equal(commentResponse.status, 404);
    assert.equal(commentResponse.body.message, 'Book not found');
    assert.equal(replyResponse.status, 404);
    assert.equal(replyResponse.body.message, 'Comment not found');
  });

  test('readers cannot edit or delete another readers comment', async () => {
    const reader = await createReaderSession(baseUrl, 'foreign-comment');
    createdUserIds.push(reader.user.id);
    transientNames.push(reader.name);

    const seededComment = await prisma.comment.findFirst({
      where: {
        user: {
          email: 'user@example.com'
        }
      },
      select: {
        id: true
      }
    });

    const [updateResponse, deleteResponse] = await Promise.all([
      jsonRequest(baseUrl, `/api/comments/${seededComment.id}`, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        },
        body: {
          content: 'This update should not be allowed because the comment belongs to someone else.'
        }
      }),
      jsonRequest(baseUrl, `/api/comments/${seededComment.id}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        }
      })
    ]);

    assert.equal(updateResponse.status, 403);
    assert.equal(updateResponse.body.message, 'Forbidden');
    assert.equal(deleteResponse.status, 403);
    assert.equal(deleteResponse.body.message, 'Forbidden');
  });

  test('review lifecycle keeps one review per reader and prevents foreign deletes', async () => {
    const reader = await createReaderSession(baseUrl, 'review-rules');
    createdUserIds.push(reader.user.id);
    transientNames.push(reader.name);

    const book = await prisma.book.findUnique({
      where: {
        slug: 'worlds-apart'
      },
      select: {
        id: true
      }
    });

    const createResponse = await jsonRequest(baseUrl, '/api/reviews', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        bookId: book.id,
        rating: 5,
        content: 'This Stage 9 review is long enough to satisfy validation and establish the first reader review record.'
      }
    });

    assert.equal(createResponse.status, 201);

    const updateResponse = await jsonRequest(baseUrl, '/api/reviews', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        bookId: book.id,
        rating: 4,
        content: 'This Stage 9 review update proves the engagement layer upserts rather than duplicating reader reviews.'
      }
    });

    assert.equal(updateResponse.status, 201);
    assert.equal(updateResponse.body.review.id, createResponse.body.review.id);

    const reviewCount = await prisma.review.count({
      where: {
        userId: reader.user.id,
        bookId: book.id
      }
    });

    assert.equal(reviewCount, 1);

    const seededReview = await prisma.review.findFirst({
      where: {
        user: {
          email: 'reader2@example.com'
        }
      },
      select: {
        id: true
      }
    });

    const foreignDelete = await jsonRequest(baseUrl, `/api/reviews/${seededReview.id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(foreignDelete.status, 404);
    assert.equal(foreignDelete.body.message, 'Review not found');
  });

  test('follow rules reject self-follow and non-author follow attempts', async () => {
    const reader = await createReaderSession(baseUrl, 'follow-rules');
    createdUserIds.push(reader.user.id);
    transientNames.push(reader.name);
    const admin = await loginAs(baseUrl, 'admin@example.com');

    const selfResponse = await jsonRequest(baseUrl, `/api/follows/authors/${reader.user.id}/toggle`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    const nonAuthorResponse = await jsonRequest(baseUrl, `/api/follows/authors/${admin.user.id}/toggle`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(selfResponse.status, 400);
    assert.equal(selfResponse.body.message, 'You cannot follow yourself');
    assert.equal(nonAuthorResponse.status, 404);
    assert.equal(nonAuthorResponse.body.message, 'Author not found');
  });
});
