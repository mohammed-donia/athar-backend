import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/errors.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'المسار غير موجود' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    res.status(400).json({ message: issues[0]?.message ?? 'بيانات غير صالحة', issues });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  const e = err as { code?: number; status?: number };

  if (e?.code === 11000) {
    res.status(409).json({ message: 'العنصر موجود مسبقاً' });
    return;
  }

  if (typeof e?.status === 'number' && e.status >= 400 && e.status < 500) {
    res.status(e.status).json({ message: 'طلب غير صالح' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'صار خطأ في السيرفر' });
}
