import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  const tokenPayload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: Number(tokenPayload.sub) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      websiteUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 401);
  }

  req.user = user;
  next();
});
