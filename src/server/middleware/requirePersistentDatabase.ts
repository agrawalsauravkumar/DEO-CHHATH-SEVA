import { RequestHandler } from 'express';
import { getDatabaseStatus } from '../db/connection';

export const requirePersistentDatabase: RequestHandler = (_req, res, next) => {
  if (getDatabaseStatus().connectionState !== 'CONNECTED') {
    return res.status(503).json({
      error: 'PostgreSQL is unavailable; this operation was not saved.',
    });
  }
  return next();
};
