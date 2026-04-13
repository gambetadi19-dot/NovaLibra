import { z } from 'zod';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { env } from '../config/env.js';
import { verifyRefreshToken } from '../utils/token.js';
import { loginUser, refreshAccessToken, registerUser, revokeRefreshTokens } from '../services/authService.js';

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8),
    bio: z.string().max(400).optional().default('')
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(10).optional()
    })
    .optional()
    .default({})
});

export const authValidators = {
  registerSchema,
  loginSchema,
  refreshSchema
};

const refreshCookieName = 'novalibra_refresh_token';

function parseDurationToMs(value) {
  const match = String(value).trim().match(/^(\d+)(ms|s|m|h|d)$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * multipliers[unit];
}

function buildRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/api/auth',
    maxAge: parseDurationToMs(env.refreshTokenExpiresIn)
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(refreshCookieName, refreshToken, buildRefreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(refreshCookieName, {
    ...buildRefreshCookieOptions(),
    maxAge: undefined
  });
}

function getRefreshTokenFromRequest(req) {
  return req.cookies?.[refreshCookieName] || req.validated?.body?.refreshToken || req.body?.refreshToken || null;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, bio } = req.validated.body;
  const authResponse = await registerUser({ name, email, password, bio });

  await createNotification({
    userId: authResponse.user.id,
    type: 'WELCOME',
    title: 'Welcome to NovaLibra',
      message: 'Your account is ready. Save books, join discussions, and follow new announcements.'
  });

  setRefreshCookie(res, authResponse.refreshToken);

  const { refreshToken: _refreshToken, ...responsePayload } = authResponse;

  res.status(201).json({
    success: true,
    ...responsePayload
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const authResponse = await loginUser(email, password);
  setRefreshCookie(res, authResponse.refreshToken);
  const { refreshToken: _refreshToken, ...responsePayload } = authResponse;

  res.json({
    success: true,
    ...responsePayload
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  const authResponse = await refreshAccessToken(refreshToken);
  setRefreshCookie(res, authResponse.refreshToken);
  const { refreshToken: _refreshToken, ...responsePayload } = authResponse;

  res.json({
    success: true,
    ...responsePayload
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (refreshToken) {
    try {
      const tokenPayload = verifyRefreshToken(refreshToken);
      await revokeRefreshTokens(Number(tokenPayload.sub));
    } catch {}
  } else if (req.auth?.sub) {
    await revokeRefreshTokens(Number(req.auth.sub));
  } else {
    clearRefreshCookie(res);
    throw new AppError('Authentication required', 401);
  }

  clearRefreshCookie(res);

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
