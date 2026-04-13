import { after, afterEach, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/db.js';
import { registerSocketHandlers } from '../../src/sockets/index.js';
import { signAccessToken } from '../../src/utils/token.js';
import { createReaderSession, jsonRequest, loginAs, startServer, stopServer } from '../helpers/httpTestUtils.js';

describe('Communications system API coverage', () => {
  let server;
  let baseUrl;
  const createdUserIds = [];
  const createdAnnouncementIds = [];
  const transientAnnouncementTitles = [];
  const transientNotificationIds = [];

  before(async () => {
    const started = await startServer(app);
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    await stopServer(server);
  });

  afterEach(async () => {
    if (createdAnnouncementIds.length) {
      await prisma.announcement.deleteMany({
        where: {
          id: {
            in: createdAnnouncementIds.splice(0, createdAnnouncementIds.length)
          }
        }
      });
    }

    const announcementTitles = transientAnnouncementTitles.splice(0, transientAnnouncementTitles.length);
    for (const title of announcementTitles) {
      await prisma.notification.deleteMany({
        where: {
          type: 'ANNOUNCEMENT',
          title
        }
      });
    }

    if (transientNotificationIds.length) {
      await prisma.notification.deleteMany({
        where: {
          id: {
            in: transientNotificationIds.splice(0, transientNotificationIds.length)
          }
        }
      });
    }

    if (createdUserIds.length) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds.splice(0, createdUserIds.length)
          }
        }
      });
    }
  });

  test('admin announcement publishing notifies the member base', async () => {
    const admin = await loginAs(baseUrl, 'admin@example.com');
    const audience = await prisma.user.findMany({
      select: { id: true }
    });
    const title = `Stage 10 Announcement ${Date.now()}`;
    transientAnnouncementTitles.push(title);

    const response = await jsonRequest(baseUrl, '/api/announcements', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${admin.accessToken}`
      },
      body: {
        title,
        content: 'This announcement confirms the communications suite can fan platform updates out to every seeded user.'
      }
    });

    assert.equal(response.status, 201);
    createdAnnouncementIds.push(response.body.announcement.id);

    const notifications = await prisma.notification.findMany({
      where: {
        type: 'ANNOUNCEMENT',
        title
      }
    });

    assert.equal(notifications.length, audience.length);
    assert.deepEqual(
      new Set(notifications.map((notification) => notification.userId)),
      new Set(audience.map((user) => user.id))
    );
  });

  test('reader cannot mark another user notification as read', async () => {
    const reader = await createReaderSession(baseUrl, 'notifications-owner');
    const otherReader = await createReaderSession(baseUrl, 'notifications-foreign');
    createdUserIds.push(reader.user.id, otherReader.user.id);

    const otherNotification = await prisma.notification.create({
      data: {
        userId: otherReader.user.id,
        type: 'MESSAGE',
        title: 'Foreign inbox item',
        message: 'This notification belongs to another user and should stay private.'
      }
    });
    transientNotificationIds.push(otherNotification.id);

    const response = await jsonRequest(baseUrl, `/api/notifications/${otherNotification.id}/read`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      }
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, 'Notification not found');
  });

  test('reader cannot message themselves', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');

    const response = await jsonRequest(baseUrl, '/api/messages', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        receiverId: reader.user.id,
        subject: 'Self message attempt',
        content: 'This should be rejected because users cannot send messages to themselves.'
      }
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'You cannot send a message to yourself');
  });

  test('reader gets a clear 404 when messaging a missing recipient', async () => {
    const reader = await loginAs(baseUrl, 'user@example.com');

    const response = await jsonRequest(baseUrl, '/api/messages', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${reader.accessToken}`
      },
      body: {
        receiverId: 999999,
        subject: 'Unknown recipient',
        content: 'This should fail cleanly when the selected recipient no longer exists.'
      }
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, 'Message recipient not found');
  });

  test('socket handlers join only the authenticated user room', async () => {
    const middlewares = [];
    let connectionHandler = null;

    const io = {
      use(handler) {
        middlewares.push(handler);
      },
      on(event, handler) {
        if (event === 'connection') {
          connectionHandler = handler;
        }
      }
    };

    registerSocketHandlers(io);

    const joinedRooms = [];
    const eventHandlers = {};
    const socket = {
      handshake: {
        auth: {
          token: signAccessToken({ id: 42, email: 'socket-user@example.com', role: 'READER' })
        }
      },
      join(room) {
        joinedRooms.push(room);
      },
      on(event, handler) {
        eventHandlers[event] = handler;
      }
    };

    await new Promise((resolve, reject) => {
      middlewares[0](socket, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    connectionHandler(socket);

    assert.equal(socket.user.id, 42);
    assert.deepEqual(joinedRooms, ['user:42']);

    eventHandlers['notifications:join']('42');
    assert.deepEqual(joinedRooms, ['user:42', 'user:42']);

    eventHandlers['notifications:join']('77');
    assert.deepEqual(joinedRooms, ['user:42', 'user:42']);
  });

  test('socket handlers stay safe when the connection has no token', async () => {
    const middlewares = [];
    let connectionHandler = null;

    const io = {
      use(handler) {
        middlewares.push(handler);
      },
      on(event, handler) {
        if (event === 'connection') {
          connectionHandler = handler;
        }
      }
    };

    registerSocketHandlers(io);

    const joinedRooms = [];
    const eventHandlers = {};
    const socket = {
      handshake: {
        auth: {}
      },
      join(room) {
        joinedRooms.push(room);
      },
      on(event, handler) {
        eventHandlers[event] = handler;
      }
    };

    await new Promise((resolve, reject) => {
      middlewares[0](socket, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    connectionHandler(socket);
    eventHandlers['notifications:join']('12');

    assert.equal(socket.user, undefined);
    assert.deepEqual(joinedRooms, []);
  });
});
