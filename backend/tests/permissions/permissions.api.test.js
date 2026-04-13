import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/app.js';

async function startServer() {
  return await new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
      });
    });
  });
}

async function stopServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function extractCookie(response) {
  const headers = response.headers.getSetCookie?.() || [];
  return headers.map((header) => header.split(';')[0]).join('; ');
}

async function jsonRequest(baseUrl, path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {}

  return {
    status: response.status,
    body: payload,
    headers: response.headers
  };
}

async function loginAs(baseUrl, email) {
  const response = await jsonRequest(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: {
      email,
      password: 'password123'
    }
  });

  assert.equal(response.status, 200, `Expected login to succeed for ${email}`);

  return {
    accessToken: response.body.accessToken,
    cookie: extractCookie(response),
    user: response.body.user
  };
}

describe('Permissions API coverage', () => {
  let server;
  let baseUrl;

  before(async () => {
    const started = await startServer();
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    await stopServer(server);
  });

  test('public routes remain available without authentication', async () => {
    const [booksResponse, authorsResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/books'),
      jsonRequest(baseUrl, '/api/users/authors')
    ]);

    assert.equal(booksResponse.status, 200);
    assert.equal(Array.isArray(booksResponse.body.books), true);
    assert.equal(authorsResponse.status, 200);
    assert.equal(Array.isArray(authorsResponse.body.authors), true);
  });

  test('protected profile and admin routes reject unauthenticated requests', async () => {
    const [profileResponse, adminResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/users/me/profile'),
      jsonRequest(baseUrl, '/api/admin/dashboard')
    ]);

    assert.equal(profileResponse.status, 401);
    assert.equal(profileResponse.body.message, 'Authentication required');
    assert.equal(adminResponse.status, 401);
    assert.equal(adminResponse.body.message, 'Authentication required');
  });

  test('reader cannot access author-only endpoints', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');

    const [booksResponse, analyticsResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/users/me/books', {
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        }
      }),
      jsonRequest(baseUrl, '/api/users/me/analytics', {
        headers: {
          authorization: `Bearer ${reader.accessToken}`
        }
      })
    ]);

    assert.equal(booksResponse.status, 403);
    assert.equal(booksResponse.body.message, 'Forbidden');
    assert.equal(analyticsResponse.status, 403);
    assert.equal(analyticsResponse.body.message, 'Forbidden');
  });

  test('reader cannot access admin-only endpoints', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');

    const response = await jsonRequest(baseUrl, '/api/admin/dashboard', {
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'Forbidden');
  });

  test('author can access author workspace endpoints', async () => {
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
    assert.equal(analyticsResponse.status, 200);
    assert.equal(typeof analyticsResponse.body.analytics, 'object');
    assert.equal(typeof analyticsResponse.body.analytics.totalBooks, 'number');
  });

  test('author cannot access admin dashboard', async () => {
    const author = await loginAs(baseUrl, 'author@example.com');

    const response = await jsonRequest(baseUrl, '/api/admin/dashboard', {
      headers: {
        authorization: `Bearer ${author.accessToken}`
      }
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'Forbidden');
  });

  test('admin can access admin dashboard and comments moderation views', async () => {
    const admin = await loginAs(baseUrl, 'admin@example.com');

    const [dashboardResponse, commentsResponse] = await Promise.all([
      jsonRequest(baseUrl, '/api/admin/dashboard', {
        headers: {
          authorization: `Bearer ${admin.accessToken}`
        }
      }),
      jsonRequest(baseUrl, '/api/admin/comments', {
        headers: {
          authorization: `Bearer ${admin.accessToken}`
        }
      })
    ]);

    assert.equal(dashboardResponse.status, 200);
    assert.equal(dashboardResponse.body.success, true);
    assert.equal(commentsResponse.status, 200);
    assert.equal(Array.isArray(commentsResponse.body.comments), true);
  });
});
