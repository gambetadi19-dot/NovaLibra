import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/db.js';
import { jsonRequest, loginAs, startServer, stopServer } from '../helpers/httpTestUtils.js';

function uniqueTitle(prefix) {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 7)}`;
}

describe('Author books and analytics API coverage', () => {
  let server;
  let baseUrl;
  const createdBookIds = [];

  before(async () => {
    const started = await startServer(app);
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    if (createdBookIds.length) {
      await prisma.book.deleteMany({
        where: {
          id: {
            in: createdBookIds
          }
        }
      });
    }

    await stopServer(server);
  });

  test('author can load their own catalog and analytics', async () => {
    const author = await loginAs(baseUrl, 'author@example.com');

    const [booksResponse, analyticsResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/users/me/books', {
        headers: {
          authorization: `Bearer ${author.accessToken}`
        }
      }),
      jsonRequest(baseUrl, '/api/users/me/analytics', {
        headers: {
          authorization: `Bearer ${author.accessToken}`
        }
      })
    ]);

    assert.equal(booksResponse.status, 200);
    assert.equal(Array.isArray(booksResponse.body.books), true);
    assert.ok(booksResponse.body.books.length >= 3);
    assert.ok(booksResponse.body.books.every((book) => book.authorId === author.user.id));

    assert.equal(analyticsResponse.status, 200);
    assert.equal(analyticsResponse.body.analytics.totalBooks >= 3, true);
    assert.equal(typeof analyticsResponse.body.analytics.followerCount, 'number');
    assert.equal(Array.isArray(analyticsResponse.body.analytics.topBooks), true);
  });

  test('author can create, update, and delete their own book', async () => {
    const author = await loginAs(baseUrl, 'author@example.com');
    const title = uniqueTitle('Stage Six Author Title');

    const createResponse = await jsonRequest(baseUrl, '/api/books', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${author.accessToken}`
      },
      body: {
        title,
        genre: 'Essays',
        category: 'Identity and Memory',
        isFeatured: true,
        shortDescription: 'A polished short description that proves the create flow is working for the author.',
        fullDescription:
          'A longer author-facing description that is comfortably above validation minimums and verifies the publishing flow end to end.',
        coverImage: 'https://example.com/stage-six-author-book.png',
        amazonUrl: 'https://example.com/stage-six-author-book'
      }
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.book.authorId, author.user.id);
    assert.equal(createResponse.body.book.isFeatured, false);
    assert.match(createResponse.body.book.slug, /stage-six-author-title/i);
    createdBookIds.push(createResponse.body.book.id);

    const updateResponse = await jsonRequest(baseUrl, `/api/books/${createResponse.body.book.id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${author.accessToken}`
      },
      body: {
        title: `${title} Revised`,
        genre: 'Memoir',
        category: 'Social Reflection',
        isFeatured: true,
        shortDescription: 'An updated short description that proves authors can refine their own published work.',
        fullDescription:
          'This revised long description confirms the author retains ownership editing rights and that the slug can change with the title.',
        coverImage: 'https://example.com/stage-six-author-book-revised.png',
        amazonUrl: 'https://example.com/stage-six-author-book-revised'
      }
    });

    assert.equal(updateResponse.status, 200);
    assert.match(updateResponse.body.book.slug, /revised/i);
    assert.equal(updateResponse.body.book.isFeatured, false);
    assert.equal(updateResponse.body.book.genre, 'Memoir');

    const deleteResponse = await jsonRequest(baseUrl, `/api/books/${createResponse.body.book.id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${author.accessToken}`
      }
    });

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.message, 'Book deleted');

    createdBookIds.splice(createdBookIds.indexOf(createResponse.body.book.id), 1);

    const deletedBook = await prisma.book.findUnique({
      where: {
        id: createResponse.body.book.id
      }
    });

    assert.equal(deletedBook, null);
  });

  test('author book validation rejects malformed URLs and too-short content', async () => {
    const author = await loginAs(baseUrl, 'author@example.com');

    const response = await jsonRequest(baseUrl, '/api/books', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${author.accessToken}`
      },
      body: {
        title: 'Bad Payload',
        genre: 'Poetry',
        category: 'General',
        isFeatured: false,
        shortDescription: 'Too short',
        fullDescription: 'Also too short for the current schema.',
        coverImage: 'not-a-url',
        amazonUrl: 'still-not-a-url'
      }
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

  test("author cannot update or delete another author's seeded book", async () => {
    const author = await loginAs(baseUrl, 'author@example.com');
    const outsiderBook = await prisma.book.create({
      data: {
        authorId: 1,
        title: uniqueTitle('Admin Owned Book'),
        slug: `admin-owned-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        genre: 'General',
        category: 'General',
        shortDescription: 'A temporary non-author-owned book used to verify author ownership enforcement.',
        fullDescription:
          'This temporary admin-owned book exists only to confirm that a normal author cannot modify or delete someone else’s content.',
        coverImage: null,
        amazonUrl: null
      }
    });
    createdBookIds.push(outsiderBook.id);

    const [updateResponse, deleteResponse] = await Promise.all([
      jsonRequest(baseUrl, `/api/books/${outsiderBook.id}`, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${author.accessToken}`
        },
        body: {
          title: 'Attempted takeover',
          genre: 'General',
          category: 'General',
          isFeatured: false,
          shortDescription: 'A valid short description for the forbidden update attempt.',
          fullDescription: 'A valid long description for the forbidden update attempt that should still be rejected.',
          coverImage: '',
          amazonUrl: ''
        }
      }),
      jsonRequest(baseUrl, `/api/books/${outsiderBook.id}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${author.accessToken}`
        }
      })
    ]);

    assert.equal(updateResponse.status, 403);
    assert.equal(updateResponse.body.message, 'Forbidden');
    assert.equal(deleteResponse.status, 403);
    assert.equal(deleteResponse.body.message, 'Forbidden');
  });

  test('newly created author book is reflected on the public author profile', async () => {
    const author = await loginAs(baseUrl, 'author@example.com');
    const title = uniqueTitle('Public Author Reflection');

    const createResponse = await jsonRequest(baseUrl, '/api/books', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${author.accessToken}`
      },
      body: {
        title,
        genre: 'Speculative Fiction',
        category: 'Coming of Age',
        isFeatured: false,
        shortDescription: 'A public profile reflection test book with a catalog-ready summary.',
        fullDescription:
          'This book exists to prove that the public author page immediately reflects newly created books from the author workspace.',
        coverImage: '',
        amazonUrl: ''
      }
    });

    assert.equal(createResponse.status, 201);
    createdBookIds.push(createResponse.body.book.id);

    const publicAuthorResponse = await jsonRequest(baseUrl, `/api/users/authors/${author.user.id}`);

    assert.equal(publicAuthorResponse.status, 200);
    assert.ok(publicAuthorResponse.body.author.books.some((book) => book.id === createResponse.body.book.id));
    assert.ok(publicAuthorResponse.body.author.books.some((book) => book.title === title));
  });
});
