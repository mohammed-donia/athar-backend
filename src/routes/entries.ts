import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../lib/errors.js';
import { buildUpdate, serializeEntry } from '../lib/serialize.js';
import { entryCreate, entryUpdate } from '../lib/validation.js';
import { uid } from '../middleware/auth.js';
import { Entry } from '../models/Entry.js';
import { Tracker } from '../models/Tracker.js';

export const entriesRouter = Router();

entriesRouter.get('/', async (req, res) => {
  const { trackerId } = z.object({ trackerId: z.string().max(64).optional() }).parse(req.query);
  const entries = await Entry.find({ userId: uid(req), ...(trackerId ? { trackerId } : {}) })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
  res.json(entries.map(serializeEntry));
});

entriesRouter.post('/', async (req, res) => {
  const userId = uid(req);
  const { createdAt, ...data } = entryCreate.parse(req.body);

  if (!(await Tracker.exists({ userId, id: data.trackerId }))) {
    throw new HttpError(404, 'المتابعة غير موجودة');
  }

  const entry = await Entry.create({
    ...data,
    userId,
    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
  });
  res.status(201).json(serializeEntry(entry.toObject()));
});

entriesRouter.patch('/:id', async (req, res) => {
  const body = entryUpdate.parse(req.body);
  const { $set, $unset } = buildUpdate(body);

  const update: Record<string, unknown> = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;

  const filter = { userId: uid(req), id: req.params.id };
  const entry = Object.keys(update).length
    ? await Entry.findOneAndUpdate(filter, update, { new: true, runValidators: true }).lean()
    : await Entry.findOne(filter).lean();

  if (!entry) throw new HttpError(404, 'التسجيل غير موجود');
  res.json(serializeEntry(entry));
});

entriesRouter.delete('/:id', async (req, res) => {
  const result = await Entry.deleteOne({ userId: uid(req), id: req.params.id });
  if (result.deletedCount === 0) throw new HttpError(404, 'التسجيل غير موجود');
  res.status(204).end();
});
