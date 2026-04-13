import { verifyAccessToken } from '../utils/token.js';

export function registerSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next();
    }

    try {
      const tokenPayload = verifyAccessToken(token);
      socket.user = {
        id: Number(tokenPayload.sub),
        role: tokenPayload.role
      };
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('notifications:join', (userId) => {
      if (socket.user?.id === Number(userId)) {
        socket.join(`user:${userId}`);
      }
    });

  });
}
