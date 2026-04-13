import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { prisma } from '../../src/config/db.js';
import { app } from '../../src/app.js';
import { jsonRequest, loginAs, startServer, stopServer } from '../helpers/httpTestUtils.js';

describe('Book domain API coverage', () => {
  let server;
  let baseUrl;
  let readerSession;
  let transientReviewId = null;

  before(async () => {
    ({ server, baseUrl } = await startServer(app));
    readerSession = await loginAs(baseUrl, 'user@example.com');
  });

  after(async () => {
    if (transientReviewId) {
      await prisma.review.deleteMany({
        where: {
          id: transientReviewId
        }
      });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: readerSession.user.id,
        book: {
          slug: 'margaret-hamata-a-woman-of-courage'
        }
      }
    });

    await stopServer(server);
  });

  test('public list books returns discovery metadata and featured titles first', async () => {
    const response = await jsonRequest(baseUrl, '/api/books');

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.books));
    assert.ok(response.body.books.length >= 3);
    assert.ok(Array.isArray(response.body.discovery.genres));
    assert.ok(Array.isArray(response.body.discovery.categories));
    assert.ok(response.body.discovery.genres.includes('Literary Fiction'));
    assert.ok(response.body.discovery.categories.includes('Family Sagas'));
    assert.equal(response.body.books[0].isFeatured, true);
    assert.ok(response.body.books.some((book) => book.slug === 'worlds-apart'));
  });

  test('book catalog supports search, genre, category, featured, and empty-result filters', async () => {
    const [searchResponse, genreResponse, categoryResponse, featuredResponse, emptyResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/books?q=Worlds'),
      jsonRequest(baseUrl, '/api/books?genre=Romance'),
      jsonRequest(baseUrl, '/api/books?category=Women%20of%20Courage'),
      jsonRequest(baseUrl, '/api/books?featured=true'),
      jsonRequest(baseUrl, '/api/books?q=NoSuchNovaLibraTitle')
    ]);

    assert.equal(searchResponse.status, 200);
    assert.ok(searchResponse.body.books.some((book) => book.slug === 'worlds-apart'));

    assert.equal(genreResponse.status, 200);
    assert.ok(genreResponse.body.books.length >= 1);
    assert.ok(genreResponse.body.books.every((book) => book.genre === 'Romance'));

    assert.equal(categoryResponse.status, 200);
    assert.ok(categoryResponse.body.books.length >= 1);
    assert.ok(categoryResponse.body.books.every((book) => book.category === 'Women of Courage'));

    assert.equal(featuredResponse.status, 200);
    assert.ok(featuredResponse.body.books.length >= 1);
    assert.ok(featuredResponse.body.books.every((book) => book.isFeatured));

    assert.equal(emptyResponse.status, 200);
    assert.equal(emptyResponse.body.books.length, 0);
  });

  test('book details returns author, review, discussion, and commerce data', async () => {
    const response = await jsonRequest(baseUrl, '/api/books/worlds-apart');

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.book.slug, 'worlds-apart');
    assert.equal(response.body.book.author.name, 'Amina Dube');
    assert.ok(Array.isArray(response.body.book.comments));
    assert.ok(Array.isArray(response.body.book.reviews));
    assert.equal(typeof response.body.book._count.comments, 'number');
    assert.equal(typeof response.body.book._count.favorites, 'number');
    assert.equal(typeof response.body.book.reviewCount, 'number');
    assert.ok(response.body.book.amazonUrl);
    assert.equal(response.body.book.isFollowingAuthor, false);
  });

  test('book details returns personalized favorite and current-review state for an authenticated reader', async () => {
    const toggleResponse = await jsonRequest(baseUrl, '/api/favorites/2/toggle', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${readerSession.accessToken}`
      }
    });

    assert.equal(toggleResponse.status, 200);
    assert.equal(toggleResponse.body.favorited, true);

    const reviewResponse = await jsonRequest(baseUrl, '/api/reviews', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${readerSession.accessToken}`
      },
      body: {
        bookId: 2,
        rating: 5,
        content: 'This Stage 8 review confirms the detail payload can reflect the current reader review alongside the catalog metrics.'
      }
    });

    assert.equal(reviewResponse.status, 201);
    transientReviewId = reviewResponse.body.review.id;

    const detailResponse = await jsonRequest(baseUrl, '/api/books/margaret-hamata-a-woman-of-courage', {
      headers: {
        authorization: `Bearer ${readerSession.accessToken}`
      }
    });

    assert.equal(detailResponse.status, 200);
    assert.equal(detailResponse.body.book.isFavorited, true);
    assert.equal(detailResponse.body.book.currentUserReview.rating, 5);
    assert.match(detailResponse.body.book.currentUserReview.content, /Stage 8 review/);
  });

  test('missing book slug returns a safe not-found response', async () => {
    const response = await jsonRequest(baseUrl, '/api/books/not-a-real-book-slug');

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, 'Book not found');
  });
});
