import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { verifyAccessToken } from './utils/token.js';

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use((req, _res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (token) {
    try {
      req.auth = verifyAccessToken(token);
    } catch {}
  }

  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'NovaLibra API is running'
  });
});

app.use('/api', routes);
app.use(errorMiddleware);
