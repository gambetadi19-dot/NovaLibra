import { prisma } from '../config/db.js';
import { emitToUser } from './socketService.js';

export async function createNotification({ userId, type, title, message }) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message
    }
  });

  emitToUser(userId, 'notification:new', notification);
  return notification;
}

export async function broadcastAnnouncementNotification(title, message) {
  const users = await prisma.user.findMany({ select: { id: true } });

  await Promise.all(
    users.map((user) =>
      createNotification({
        userId: user.id,
        type: 'ANNOUNCEMENT',
        title,
        message
      })
    )
  );
}
