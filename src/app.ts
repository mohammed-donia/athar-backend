import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { dataRouter } from './routes/data.js';
import { entriesRouter } from './routes/entries.js';
import { trackersRouter } from './routes/trackers.js';

export function createApp() {
  const app = express();

  if (config.isProd) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigins }));

  app.use('/api/data/import', express.json({ limit: '10mb' }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/trackers', requireAuth, trackersRouter);
  app.use('/api/entries', requireAuth, entriesRouter);
  app.use('/api/data', requireAuth, dataRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
