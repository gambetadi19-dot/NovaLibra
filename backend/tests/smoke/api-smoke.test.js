import { describe, test } from 'node:test';
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

describe('API smoke', () => {
  test('GET /api/health returns success payload', async () => {
    const { server, baseUrl } = await startServer();

    try {
      const response = await fetch(`${baseUrl}/api/health`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.message, 'NovaLibra API is running');
    } finally {
      await stopServer(server);
    }
  });

  test('GET /api/books responds publicly', async () => {
    const { server, baseUrl } = await startServer();

    try {
      const response = await fetch(`${baseUrl}/api/books`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(Array.isArray(body.books), true);
    } finally {
      await stopServer(server);
    }
  });

  test('GET /api/announcements responds publicly', async () => {
    const { server, baseUrl } = await startServer();

    try {
      const response = await fetch(`${baseUrl}/api/announcements`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(Array.isArray(body.announcements), true);
    } finally {
      await stopServer(server);
    }
  });
});
