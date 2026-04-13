import { z } from 'zod';
import { prisma } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

const reviewSchema = z.object({
  body: z.object({
    bookId: z.coerce.number().int().positive(),
    rating: z.coerce.number().int().min(1).max(5),
    content: z.string().min(20).max(1500)
  })
});

export const reviewValidators = {
  reviewSchema
};

export const upsertReview = asyncHandler(async (req, res) => {
  const { bookId, rating, content } = req.validated.body;

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      title: true,
      authorId: true
    }
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  const review = await prisma.review.upsert({
    where: {
      userId_bookId: {
        userId: req.user.id,
        bookId
      }
    },
    create: {
      userId: req.user.id,
      bookId,
      rating,
      content
    },
    update: {
      rating,
      content
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true
        }
      }
    }
  });

  if (book.authorId !== req.user.id) {
    await createNotification({
      userId: book.authorId,
      type: 'REVIEW',
      title: 'New review on your book',
      message: `${req.user.name} left a ${rating}-star review on ${book.title}.`
    });
  }

  res.status(201).json({
    success: true,
    review
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const existing = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      userId: true
    }
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new AppError('Review not found', 404);
  }

  await prisma.review.delete({
    where: { id: reviewId }
  });

  res.json({
    success: true,
    message: 'Review deleted'
  });
});
