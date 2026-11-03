import { Router } from 'express';
import { serializeEntry, serializeTracker } from '../lib/serialize.js';
import { withTransaction } from '../lib/transaction.js';
import { importBody } from '../lib/validation.js';
import { uid } from '../middleware/auth.js';
import { Entry } from '../models/Entry.js';
import { Tracker } from '../models/Tracker.js';

export const dataRouter = Router();

dataRouter.get('/', async (req, res) => {
  const userId = uid(req);
  const [trackers, entries] = await Promise.all([
    Tracker.find({ userId }).sort({ createdAt: 1 }).lean(),
    Entry.find({ userId }).sort({ createdAt: 1, _id: 1 }).lean(),
  ]);
  res.json({
    trackers: trackers.map(serializeTracker),
    entries: entries.map(serializeEntry),
  });
});

dataRouter.post('/import', async (req, res) => {
  const userId = uid(req);
  const body = importBody.parse(req.body);

  const trackers = [...new Map(body.trackers.map((t) => [t.id, t])).values()];
  const trackerIds = new Set(trackers.map((t) => t.id));
  const entries = [...new Map(body.entries.map((e) => [e.id, e])).values()].filter((e) =>
    trackerIds.has(e.trackerId)
  );

  await withTransaction(async (session) => {
    const opts = session ? { session } : {};
    await Entry.deleteMany({ userId }, opts);
    await Tracker.deleteMany({ userId }, opts);

    if (trackers.length) {
      await Tracker.insertMany(
        trackers.map(({ createdAt, archivedAt, ...t }) => ({
          ...t,
          userId,
          ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
          ...(archivedAt ? { archivedAt: new Date(archivedAt) } : {}),
        })),
        opts
      );
    }
    if (entries.length) {
      await Entry.insertMany(
        entries.map(({ createdAt, ...e }) => ({
          ...e,
          userId,
          ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
        })),
        opts
      );
    }
  });

  res.json({ trackers: trackers.length, entries: entries.length });
});

dataRouter.delete('/', async (req, res) => {
  const userId = uid(req);
  await withTransaction(async (session) => {
    const opts = session ? { session } : {};
    await Entry.deleteMany({ userId }, opts);
    await Tracker.deleteMany({ userId }, opts);
  });
  res.status(204).end();
});
