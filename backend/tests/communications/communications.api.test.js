import { after, afterEach, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/db.js';
import { createReaderSession, jsonRequest, loginAs, startServer, stopServer } from '../helpers/httpTestUtils.js';

describe('Reader communications API coverage', () => {
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

  test('reader inbox includes their own conversations only', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');

    const response = await jsonRequest(baseUrl, '/api/messages', {
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body.messages), true);
    assert.ok(response.body.messages.length >= 2);
    assert.ok(response.body.messages.every((message) => message.senderId === reader.user.id || message.receiverId === reader.user.id));
  });

  test('reader can send a message to an author and the author gets notified', async () => {
    const reader = await createReaderSession(baseUrl, 'messages');
    createdUserIds.push(reader.user.id);
    transientReaderNames.push(reader.name);

    const author = await prisma.user.findUnique({
      where: { email: 'author@example.com' },
      select: { id: true }
    });

    const createResponse = await jsonRequest(baseUrl, '/api/messages', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        receiverId: author.id,
        subject: 'Reader outreach from Stage 5',
        content: 'This message proves the reader inbox can reach an author with enough detail to satisfy validation.'
      }
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.message.receiverId, author.id);
    assert.equal(createResponse.body.message.senderId, reader.user.id);

    const notification = await prisma.notification.findFirst({
      where: {
        userId: author.id,
        type: 'MESSAGE',
        message: {
          contains: reader.name
        }
      }
    });

    assert.ok(notification);
  });

  test('reader cannot send direct messages to another reader', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');
    const otherReader = await prisma.user.findUnique({
      where: { email: 'reader2@example.com' },
      select: { id: true }
    });

    const response = await jsonRequest(baseUrl, '/api/messages', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        receiverId: otherReader.id,
        subject: 'This should fail',
        content: 'Readers should not be able to open direct message threads with other readers in the current ruleset.'
      }
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'Messages can currently be sent to authors or the platform team only');
  });

  test('reader can mark an incoming message as read', async () => {
    const reader = await createReaderSession(baseUrl, 'read-state');
    createdUserIds.push(reader.user.id);
    transientReaderNames.push(reader.name);

    const author = await prisma.user.findUnique({
      where: { email: 'author@example.com' },
      select: { id: true }
    });

    const incomingMessage = await prisma.message.create({
      data: {
        senderId: author.id,
        receiverId: reader.user.id,
        subject: 'Incoming note',
        content: 'This seeded incoming message exists so the reader can mark it as read through the API.',
        status: 'UNREAD'
      }
    });

    const response = await jsonRequest(baseUrl, `/api/messages/${incomingMessage.id}/read`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.message.status, 'READ');
  });

  test('reader can fetch notifications and mark them read', async () => {
    const reader = await createReaderSession(baseUrl, 'notifications');
    createdUserIds.push(reader.user.id);
    transientReaderNames.push(reader.name);

    const unreadSeed = await prisma.notification.create({
      data: {
        userId: reader.user.id,
        type: 'MESSAGE',
        title: 'Fresh unread notification',
        message: `${reader.name} has a new notification ready for the communications suite.`
      }
    });

    const listResponse = await jsonRequest(baseUrl, '/api/notifications', {
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(listResponse.status, 200);
    assert.equal(Array.isArray(listResponse.body.notifications), true);
    assert.ok(listResponse.body.notifications.length >= 1);

    const unreadNotification = listResponse.body.notifications.find((notification) => notification.id === unreadSeed.id);
    assert.ok(unreadNotification);

    const markOneResponse = await jsonRequest(baseUrl, `/api/notifications/${unreadNotification.id}/read`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(markOneResponse.status, 200);
    assert.equal(markOneResponse.body.notification.isRead, true);

    const markAllResponse = await jsonRequest(baseUrl, '/api/notifications/read-all', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(markAllResponse.status, 200);
    assert.equal(markAllResponse.body.message, 'Notifications marked as read');
  });
});
