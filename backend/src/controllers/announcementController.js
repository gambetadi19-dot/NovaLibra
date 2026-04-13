import { z } from 'zod';
import { prisma } from '../config/db.js';
import { broadcastAnnouncementNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const announcementSchema = z.object({
  body: z.object({
    title: z.string().min(4).max(160),
    content: z.string().min(10).max(3000)
  })
});

const announcementIdSchema = z.object({
  params: z.object({
    announcementId: z.coerce.number().int().positive()
  })
});

export const announcementValidators = {
  announcementSchema,
  announcementIdSchema
};

export const listAnnouncements = asyncHandler(async (_req, res) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    announcements
  });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content } = req.validated.body;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content
    }
  });

  await broadcastAnnouncementNotification(title, content);

  res.status(201).json({
    success: true,
    announcement
  });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.validated.params;
  const { title, content } = req.validated.body;

  const announcement = await prisma.announcement.update({
    where: { id: announcementId },
    data: {
      title,
      content
    }
  });

  res.json({
    success: true,
    announcement
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.validated.params;

  await prisma.announcement.delete({
    where: { id: announcementId }
  });

  res.json({
    success: true,
    message: 'Announcement deleted'
  });
});
