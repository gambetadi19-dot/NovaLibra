import assert from 'node:assert/strict';

export async function startServer(app) {
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

export async function stopServer(server) {
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

export function extractCookie(response) {
  const headers = response.headers.getSetCookie?.() || [];
  return headers.map((header) => header.split(';')[0]).join('; ');
}

export async function jsonRequest(baseUrl, path, { method = 'GET', body, headers = {} } = {}) {
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

export async function loginAs(baseUrl, email, password = 'password123') {
  const response = await jsonRequest(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  assert.equal(response.status, 200, `Expected login to succeed for ${email}`);

  return {
    accessToken: response.body.accessToken,
    cookie: extractCookie(response),
    user: response.body.user
  };
}

export async function createReaderSession(baseUrl, suffix = Date.now()) {
  const email = `stage5-reader-${suffix}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const name = `Stage Five Reader ${String(suffix).slice(-4)}`;
  const response = await jsonRequest(baseUrl, '/api/auth/register', {
    method: 'POST',
    body: {
      name,
      email,
      password: 'password123',
      bio: 'Created for the Stage 5 reader suite.'
    }
  });

  assert.equal(response.status, 201, 'Expected reader registration to succeed');

  return {
    accessToken: response.body.accessToken,
    cookie: extractCookie(response),
    user: response.body.user,
    name,
    email
  };
}
