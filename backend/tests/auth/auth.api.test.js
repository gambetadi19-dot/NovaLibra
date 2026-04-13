import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/db.js';

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

function extractCookies(response) {
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

describe('Auth API coverage', () => {
  let server;
  let baseUrl;
  let createdUserIds;

  before(async () => {
    const started = await startServer();
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    await stopServer(server);
  });

  beforeEach(() => {
    createdUserIds = [];
  });

  afterEach(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds
          }
        }
      });
    }
  });

  test('POST /api/auth/register creates a reader account and returns an access token', async () => {
    const email = `stage2-register-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
    const response = await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Stage Two Reader',
        email,
        password: 'password123',
        bio: 'Created by the auth stage test suite.'
      }
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.user.email, email);
    assert.equal(response.body.user.role, 'READER');
    assert.ok(response.body.accessToken);
    assert.match(extractCookies(response), /novalibra_refresh_token=/);

    createdUserIds.push(response.body.user.id);
  });

  test('POST /api/auth/register rejects invalid payloads', async () => {
    const response = await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'A',
        email: 'not-an-email',
        password: 'short'
      }
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

  test('POST /api/auth/register rejects duplicate email addresses', async () => {
    const response = await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Reader',
        email: 'user@example.com',
        password: 'password123',
        bio: ''
      }
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.message, 'Email is already in use');
  });

  test('POST /api/auth/login succeeds for seeded roles', async () => {
    const expectations = [
      ['admin@example.com', 'ADMIN'],
      ['author@example.com', 'AUTHOR'],
      ['user@example.com', 'READER']
    ];

    for (const [email, role] of expectations) {
      const response = await jsonRequest(baseUrl, '/api/auth/login', {
        method: 'POST',
        body: {
          email,
          password: 'password123'
        }
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.user.role, role);
      assert.ok(response.body.accessToken);
      assert.match(extractCookies(response), /novalibra_refresh_token=/);
    }
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    const response = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@example.com',
        password: 'not-the-right-password'
      }
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'Invalid credentials');
  });

  test('POST /api/auth/refresh issues a new access token when the refresh cookie is valid', async () => {
    const loginResponse = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'password123'
      }
    });
    const cookie = extractCookies(loginResponse);

    const refreshResponse = await jsonRequest(baseUrl, '/api/auth/refresh', {
      method: 'POST',
      headers: {
        cookie
      }
    });

    assert.equal(refreshResponse.status, 200);
    assert.equal(refreshResponse.body.success, true);
    assert.equal(refreshResponse.body.user.email, 'user@example.com');
    assert.ok(refreshResponse.body.accessToken);
    assert.match(extractCookies(refreshResponse), /novalibra_refresh_token=/);
  });

  test('POST /api/auth/refresh rejects requests without a refresh token', async () => {
    const response = await jsonRequest(baseUrl, '/api/auth/refresh', {
      method: 'POST'
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'Refresh token is required');
  });

  test('GET /api/auth/me returns the authenticated user for a fresh access token', async () => {
    const loginResponse = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        email: 'author@example.com',
        password: 'password123'
      }
    });

    const meResponse = await jsonRequest(baseUrl, '/api/auth/me', {
      headers: {
        authorization: `Bearer ${loginResponse.body.accessToken}`
      }
    });

    assert.equal(meResponse.status, 200);
    assert.equal(meResponse.body.success, true);
    assert.equal(meResponse.body.user.email, 'author@example.com');
    assert.equal(meResponse.body.user.role, 'AUTHOR');
  });

  test('POST /api/auth/logout revokes the refresh token cookie', async () => {
    const loginResponse = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@example.com',
        password: 'password123'
      }
    });
    const cookie = extractCookies(loginResponse);

    const logoutResponse = await jsonRequest(baseUrl, '/api/auth/logout', {
      method: 'POST',
      headers: {
        cookie
      }
    });

    assert.equal(logoutResponse.status, 200);
    assert.equal(logoutResponse.body.success, true);

    const refreshAfterLogout = await jsonRequest(baseUrl, '/api/auth/refresh', {
      method: 'POST',
      headers: {
        cookie
      }
    });

    assert.equal(refreshAfterLogout.status, 401);
    assert.equal(refreshAfterLogout.body.message, 'Invalid refresh token');
  });
});
