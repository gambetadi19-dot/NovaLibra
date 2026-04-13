let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

export function getSocketServer() {
  return ioInstance;
}

export function emitToUser(userId, event, eventPayload) {
  if (!ioInstance) {
    return;
  }

  ioInstance.to(`user:${userId}`).emit(event, eventPayload);
}
