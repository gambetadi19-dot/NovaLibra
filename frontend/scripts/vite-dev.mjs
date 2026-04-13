import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.HOST || 'localhost';
const port = Number(process.env.PORT || 5173);

const server = await createServer({
  configFile: false,
  plugins: [react()],
  server: {
    host,
    port
  }
});

await server.listen();
server.printUrls();
