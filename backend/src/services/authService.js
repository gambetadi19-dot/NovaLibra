import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';

export async function buildAuthResponse(user) {
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    websiteUrl: user.websiteUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return {
    user: safeUser,
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  };
}

export async function registerUser(data) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new AppError('Email is already in use', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      bio: data.bio,
      role: Role.READER
    }
  });

  return buildAuthResponse(user);
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  return buildAuthResponse(user);
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401);
  }

  const tokenPayload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: Number(tokenPayload.sub) } });

  if (!user || user.refreshTokenVersion !== tokenPayload.version) {
    throw new AppError('Invalid refresh token', 401);
  }

  return buildAuthResponse(user);
}

export async function revokeRefreshTokens(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenVersion: { increment: 1 } }
  });
}
