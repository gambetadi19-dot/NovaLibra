import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { signAccessToken } from '../src/utils/token.js';

const originalNodeEnv = process.env.NODE_ENV;
const originalMethods = new Map();
const prismaTargets = [
  ['user', 'findUnique'],
  ['book', 'findUnique'],
  ['book', 'create'],
  ['book', 'update'],
  ['book', 'delete'],
  ['comment', 'findUnique'],
  ['comment', 'delete']
];

function stubPrisma(modelName, methodName, implementation) {
  const model = prisma[modelName];
  const key = `${modelName}.${methodName}`;

  if (!originalMethods.has(key)) {
    originalMethods.set(key, model[methodName]);
  }

  model[methodName] = implementation;
}

function restorePrisma() {
  for (const [modelName, methodName] of prismaTargets) {
    const key = `${modelName}.${methodName}`;
    if (originalMethods.has(key)) {
      prisma[modelName][methodName] = originalMethods.get(key);
    }
  }
}

function createAccessToken(user) {
  return signAccessToken({
    id: user.id,
    email: user.email ?? `${user.role.toLowerCase()}-${user.id}@example.com`,
    role: user.role
  });
}

async function startServer() {
  return new Promise((resolve) => {
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
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function apiRequest(baseUrl, path, { token, method = 'GET', body } = {}) {
  const headers = {};

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

describe('API security coverage', () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'production';

    const started = await startServer();
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    restorePrisma();
    await stopServer(server);
    process.env.NODE_ENV = originalNodeEnv;
  });

  beforeEach(() => {
    restorePrisma();
  });

  afterEach(() => {
    restorePrisma();
  });

  test('GET /api/auth/me rejects requests without a bearer token', async () => {
    const response = await apiRequest(baseUrl, '/api/auth/me');

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'Authentication required');
  });

  test('GET /api/auth/me rejects tokens for deleted users', async () => {
    stubPrisma('user', 'findUnique', async () => null);

    const token = createAccessToken({
      id: 77,
      role: 'AUTHOR'
    });

    const response = await apiRequest(baseUrl, '/api/auth/me', { token });

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'User not found');
  });

  test('GET /api/auth/me returns the authenticated user when the token is valid', async () => {
    const user = {
      id: 12,
      name: 'Ada Author',
      email: 'ada@example.com',
      role: 'AUTHOR',
      bio: '',
      avatarUrl: null,
      websiteUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    stubPrisma('user', 'findUnique', async () => user);

    const response = await apiRequest(baseUrl, '/api/auth/me', {
      token: createAccessToken(user)
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.deepEqual(response.body.user, user);
  });

  test('POST /api/books blocks authenticated readers from author-only creation', async () => {
    const reader = {
      id: 24,
      name: 'Rita Reader',
      email: 'rita@example.com',
      role: 'READER',
      bio: '',
      avatarUrl: null,
      websiteUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    stubPrisma('user', 'findUnique', async () => reader);

    const response = await apiRequest(baseUrl, '/api/books', {
      method: 'POST',
      token: createAccessToken(reader),
      body: {
        title: 'Blocked Reader Draft',
        genre: 'Fantasy',
        category: 'Epic',
        isFeatured: true,
        shortDescription: 'A reader should not be allowed to publish this.',
        fullDescription: 'This is a valid book description, but the caller does not have author permissions.',
        coverImage: '',
        amazonUrl: ''
      }
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'Forbidden');
  });

  test('POST /api/books lets authors create books but strips featured access', async () => {
    const author = {
      id: 31,
      name: 'Avery Author',
      email: 'avery@example.com',
      role: 'AUTHOR',
      bio: '',
      avatarUrl: null,
      websiteUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    let createPayload;

    stubPrisma('user', 'findUnique', async () => author);
    stubPrisma('book', 'create', async ({ data }) => {
      createPayload = data;

      return {
        id: 501,
        ...data,
        author: {
          id: author.id,
          name: author.name,
          role: author.role,
          isFeaturedAuthor: false,
          avatarUrl: null,
          bio: ''
        }
      };
    });

    const response = await apiRequest(baseUrl, '/api/books', {
      method: 'POST',
      token: createAccessToken(author),
      body: {
        title: 'A Sensible Test Book',
        genre: 'Fantasy',
        category: 'Epic',
        isFeatured: true,
        shortDescription: 'A valid summary long enough to satisfy the schema.',
        fullDescription: 'A valid long-form description that proves authors can create books without elevating featured status.',
        coverImage: '',
        amazonUrl: ''
      }
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(createPayload.authorId, author.id);
    assert.equal(createPayload.isFeatured, false);
  });

  test('PATCH /api/books/:bookId rejects non-owner authors', async () => {
    const author = {
      id: 44,
      name: 'Nina NonOwner',
      email: 'nina@example.com',
      role: 'AUTHOR',
      bio: '',
      avatarUrl: null,
      websiteUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    stubPrisma('user', 'findUnique', async () => author);
    stubPrisma('book', 'findUnique', async () => ({
      id: 91,
      authorId: 99
    }));

    const response = await apiRequest(baseUrl, '/api/books/91', {
      method: 'PATCH',
      token: createAccessToken(author),
      body: {
        title: 'Updated Title',
        genre: 'Fantasy',
        category: 'Epic',
        isFeatured: false,
        shortDescription: 'A valid summary for an update attempt by the wrong author.',
        fullDescription: 'This update should be blocked because the current author does not own the targeted book.',
        coverImage: '',
        amazonUrl: ''
      }
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'Forbidden');
  });

  test("PATCH /api/books/:bookId allows admins to manage another author's book", async () => {
    const admin = {
      id: 1,
      name: 'Amara Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      bio: '',
      avatarUrl: null,
      websiteUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    let updatePayload;

    stubPrisma('user', 'findUnique', async () => admin);
    stubPrisma('book', 'findUnique', async () => ({
      id: 91,
      authorId: 55
    }));
    stubPrisma('book', 'update', async ({ data }) => {
      updatePayload = data;

      return {
        id: 91,
        authorId: 55,
        ...data,
        author: {
          id: 55,
          name: 'Original Owner',
          role: 'AUTHOR',
          isFeaturedAuthor: false,
          avatarUrl: null,
          bio: ''
        }
      };
    });

    const response = await apiRequest(baseUrl, '/api/books/91', {
      method: 'PATCH',
      token: createAccessToken(admin),
      body: {
        title: 'Admin Curated Title',
        genre: 'Fantasy',
        category: 'Epic',
        isFeatured: true,
        shortDescription: 'An admin can legitimately curate a book owned by another author.',
        fullDescription: 'This update should succeed because administrators are allowed to manage books across ownership boundaries.',
        coverImage: '',
        amazonUrl: ''
      }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(updatePayload.isFeatured, true);
  });

  test('DELETE /api/comments/:commentId rejects non-owner non-admin users', async () => {
    const user = {
      id: 61,
      name: 'Casey Commenter',
      email: 'casey@example.com',
      role: 'READER',
      bio: '',
      avatarUrl: null,
      websiteUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    stubPrisma('user', 'findUnique', async () => user);
    stubPrisma('comment', 'findUnique', async () => ({
      id: 8,
      userId: 75
    }));

    const response = await apiRequest(baseUrl, '/api/comments/8', {
      method: 'DELETE',
      token: createAccessToken(user)
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'Forbidden');
  });

  test('DELETE /api/comments/:commentId allows admins to moderate other users comments', async () => {
    const admin = {
      id: 2,
      name: 'Morgan Moderator',
      email: 'morgan@example.com',
      role: 'ADMIN',
      bio: '',
      avatarUrl: null,
      websiteUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    let deletedCommentId = null;

    stubPrisma('user', 'findUnique', async () => admin);
    stubPrisma('comment', 'findUnique', async () => ({
      id: 8,
      userId: 75
    }));
    stubPrisma('comment', 'delete', async ({ where }) => {
      deletedCommentId = where.id;
      return { id: where.id };
    });

    const response = await apiRequest(baseUrl, '/api/comments/8', {
      method: 'DELETE',
      token: createAccessToken(admin)
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(deletedCommentId, 8);
  });
});
