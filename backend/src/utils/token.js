import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenExpiresIn }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      version: user.refreshTokenVersion
    },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenExpiresIn }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
