import { prisma } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const toggleFavorite = asyncHandler(async (req, res) => {
  const bookId = Number(req.params.bookId);
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      title: true,
      slug: true,
      authorId: true
    }
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  const existing = await prisma.favorite.findFirst({
    where: {
      bookId,
      userId: req.user.id
    }
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id }
    });

    return res.json({
      success: true,
      favorited: false
    });
  }

  await prisma.favorite.create({
    data: {
      bookId,
      userId: req.user.id
    }
  });

  if (book.authorId !== req.user.id) {
    await createNotification({
      userId: book.authorId,
      type: 'SYSTEM',
      title: `New save on ${book.title}`,
      message: `${req.user.name} saved ${book.title} to their favourites.`
    });
  }

  res.json({
    success: true,
    favorited: true
  });
});
