export function errorMiddleware(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}
