import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { registerSocketHandlers } from './sockets/index.js';
import { setSocketServer } from './services/socketService.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true
  }
});

setSocketServer(io);
registerSocketHandlers(io);

server.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});

app.get("/", (req, res) => {
  res.send("NovaLibra API running 🚀");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "Database connected ✅",
      result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Database connection failed ❌",
      error: error.message
    });
  }
});
