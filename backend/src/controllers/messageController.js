import { z } from 'zod';
import { prisma } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';
import { emitToUser } from '../services/socketService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

const messageSchema = z.object({
  body: z.object({
    receiverId: z.coerce.number().int().positive(),
    subject: z.string().max(160).optional().default(''),
    content: z.string().min(2).max(2000)
  })
});

export const messageValidators = {
  messageSchema
};

export const listMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.message.findMany({
    where:
      req.user.role === 'ADMIN'
        ? undefined
        : {
            OR: [{ senderId: req.user.id }, { receiverId: req.user.id }]
          },
    include: {
      sender: {
        select: { id: true, name: true, role: true, avatarUrl: true }
      },
      receiver: {
        select: { id: true, name: true, role: true, avatarUrl: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    messages
  });
});

export const createMessage = asyncHandler(async (req, res) => {
  const { receiverId, subject, content } = req.validated.body;
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, name: true, role: true }
  });

  if (!receiver) {
    throw new AppError('Message recipient not found', 404);
  }

  if (receiverId === req.user.id) {
    throw new AppError('You cannot send a message to yourself', 400);
  }

  const senderCanUseDirectMessages = req.user.role === 'ADMIN' || req.user.role === 'AUTHOR' || req.user.role === 'READER';
  const authorOrAdminConversation =
    req.user.role === 'ADMIN' ||
    req.user.role === 'AUTHOR' ||
    receiver.role === 'ADMIN' ||
    receiver.role === 'AUTHOR';

  if (!senderCanUseDirectMessages || !authorOrAdminConversation) {
    throw new AppError('Messages can currently be sent to authors or the platform team only', 403);
  }

  const message = await prisma.message.create({
    data: {
      senderId: req.user.id,
      receiverId,
      subject,
      content
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true, avatarUrl: true }
      },
      receiver: {
        select: { id: true, name: true, role: true, avatarUrl: true }
      }
    }
  });

  emitToUser(receiverId, 'message:new', message);

  const recipientLabel = receiver.role === 'AUTHOR' ? 'author' : 'platform team';

  await createNotification({
    userId: receiverId,
    type: 'MESSAGE',
    title: 'New message received',
    message: `${req.user.name} sent you a message for the ${recipientLabel}${subject ? `: ${subject}` : '.'}`
  });

  res.status(201).json({
    success: true,
    message
  });
});

export const markMessageRead = asyncHandler(async (req, res) => {
  const messageId = Number(req.params.messageId);
  const existing = await prisma.message.findUnique({
    where: { id: messageId }
  });

  if (!existing || (existing.receiverId !== req.user.id && req.user.role !== 'ADMIN')) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  const message = await prisma.message.update({
    where: { id: messageId },
    data: {
      status: 'READ'
    }
  });

  res.json({
    success: true,
    message
  });
});
