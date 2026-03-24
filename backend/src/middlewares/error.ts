import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation Error', details: err.errors });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({ error: message });
};
