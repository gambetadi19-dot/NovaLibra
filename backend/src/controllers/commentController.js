import { z } from 'zod';
import { prisma } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { sanitizeText } from '../utils/sanitize.js';

const commentBodySchema = z.object({
  body: z.object({
    bookId: z.coerce.number().int().positive(),
    content: z.string().min(2).max(2000)
  })
});

const commentIdSchema = z.object({
  params: z.object({
    commentId: z.coerce.number().int().positive()
  })
});

const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(2).max(2000)
  }),
  params: z.object({
    commentId: z.coerce.number().int().positive()
  })
});

const replySchema = z.object({
  body: z.object({
    content: z.string().min(2).max(1000)
  }),
  params: z.object({
    commentId: z.coerce.number().int().positive()
  })
});

export const commentValidators = {
  commentBodySchema,
  commentIdSchema,
  updateCommentSchema,
  replySchema
};

export const createComment = asyncHandler(async (req, res) => {
  const { bookId, content } = req.validated.body;
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true }
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      bookId,
      userId: req.user.id,
      content: sanitizeText(content)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    comment
  });
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.validated.params;
  const { content } = req.validated.body;

  const existing = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!existing) {
    throw new AppError('Comment not found', 404);
  }

  if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: sanitizeText(content) }
  });

  res.json({
    success: true,
    comment
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.validated.params;
  const existing = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!existing) {
    throw new AppError('Comment not found', 404);
  }

  if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  res.json({
    success: true,
    message: 'Comment deleted'
  });
});

export const createReply = asyncHandler(async (req, res) => {
  const { commentId } = req.validated.params;
  const { content } = req.validated.body;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      book: {
        select: {
          title: true
        }
      }
    }
  });

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  const reply = await prisma.reply.create({
    data: {
      commentId,
      userId: req.user.id,
      content: sanitizeText(content)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true
        }
      }
    }
  });

  if (comment.userId !== req.user.id) {
    await createNotification({
      userId: comment.userId,
      type: 'COMMENT_REPLY',
      title: `New reply on ${comment.book.title}`,
      message: `${req.user.name} replied to your comment on ${comment.book.title}.`
    });
  }

  res.status(201).json({
    success: true,
    reply
  });
});
