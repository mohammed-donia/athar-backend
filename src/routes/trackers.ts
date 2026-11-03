import { Router } from 'express';
import { HttpError } from '../lib/errors.js';
import { buildUpdate, serializeTracker } from '../lib/serialize.js';
import { withTransaction } from '../lib/transaction.js';
import { trackerCreate, trackerUpdate } from '../lib/validation.js';
import { uid } from '../middleware/auth.js';
import { Entry } from '../models/Entry.js';
import { Tracker } from '../models/Tracker.js';

export const trackersRouter = Router();

trackersRouter.get('/', async (req, res) => {
  const trackers = await Tracker.find({ userId: uid(req) }).sort({ createdAt: 1 }).lean();
  res.json(trackers.map(serializeTracker));
});

trackersRouter.post('/', async (req, res) => {
  const { createdAt, archivedAt, ...data } = trackerCreate.parse(req.body);
  const tracker = await Tracker.create({
    ...data,
    userId: uid(req),
    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    ...(archivedAt ? { archivedAt: new Date(archivedAt) } : {}),
  });
  res.status(201).json(serializeTracker(tracker.toObject()));
});

trackersRouter.patch('/:id', async (req, res) => {
  const body = trackerUpdate.parse(req.body);
  const { $set, $unset } = buildUpdate(body);

  const update: Record<string, unknown> = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;

  const filter = { userId: uid(req), id: req.params.id };
  const tracker = Object.keys(update).length
    ? await Tracker.findOneAndUpdate(filter, update, { new: true, runValidators: true }).lean()
    : await Tracker.findOne(filter).lean();

  if (!tracker) throw new HttpError(404, 'المتابعة غير موجودة');
  res.json(serializeTracker(tracker));
});

trackersRouter.delete('/:id', async (req, res) => {
  const userId = uid(req);
  const id = req.params.id;

  const deleted = await withTransaction(async (session) => {
    const opts = session ? { session } : {};
    const result = await Tracker.deleteOne({ userId, id }, opts);
    if (result.deletedCount === 0) return false;
    await Entry.deleteMany({ userId, trackerId: id }, opts);
    return true;
  });

  if (!deleted) throw new HttpError(404, 'المتابعة غير موجودة');
  res.status(204).end();
});
