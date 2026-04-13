import { prisma } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const toggleFollowAuthor = asyncHandler(async (req, res) => {
  const authorId = Number(req.params.authorId);

  if (authorId === req.user.id) {
    throw new AppError('You cannot follow yourself', 400);
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: {
      id: true,
      role: true,
      name: true
    }
  });

  if (!author || author.role !== 'AUTHOR') {
    throw new AppError('Author not found', 404);
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: authorId
      }
    }
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: authorId
        }
      }
    });

    return res.json({
      success: true,
      following: false
    });
  }

  await prisma.follow.create({
    data: {
      followerId: req.user.id,
      followingId: authorId
    }
  });

  await createNotification({
    userId: authorId,
    type: 'FOLLOW',
    title: 'New follower',
    message: `${req.user.name} is now following your author profile.`
  });

  res.json({
    success: true,
    following: true
  });
});
