import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from '../lib/errors.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'لازم تسجل دخولك');
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    if (typeof payload === 'string' || !payload.sub) throw new Error('bad payload');
    req.userId = payload.sub;
    next();
  } catch {
    throw new HttpError(401, 'انتهت الجلسة، سجّل دخولك من جديد');
  }
}

export function uid(req: Request): string {
  if (!req.userId) throw new HttpError(401, 'لازم تسجل دخولك');
  return req.userId;
}
