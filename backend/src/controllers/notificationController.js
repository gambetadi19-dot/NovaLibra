import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    notifications
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.notificationId);

  const existing = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!existing || existing.userId !== req.user.id) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });

  res.json({
    success: true,
    notification
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  res.json({
    success: true,
    message: 'Notifications marked as read'
  });
});
