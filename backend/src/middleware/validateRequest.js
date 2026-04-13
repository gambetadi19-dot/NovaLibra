import { AppError } from '../utils/appError.js';

export function validateRequest(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      return next(new AppError(result.error.issues[0]?.message || 'Validation failed', 400));
    }

    req.validated = result.data;
    next();
  };
}
