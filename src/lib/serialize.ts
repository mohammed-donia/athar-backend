import type { ITracker } from '../models/Tracker.js';
import type { IEntry } from '../models/Entry.js';


export function serializeTracker(t: ITracker) {
  return {
    id: t.id,
    name: t.name,
    ...(t.description ? { description: t.description } : {}),
    category: t.category,
    unit: t.unit,
    type: t.type,
    ...(t.icon ? { icon: t.icon } : {}),
    ...(t.color ? { color: t.color } : {}),
    ...(t.goal ? { goal: { target: t.goal.target, period: t.goal.period } } : {}),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    ...(t.archivedAt ? { archivedAt: t.archivedAt.toISOString() } : {}),
  };
}

export function serializeEntry(e: IEntry) {
  return {
    id: e.id,
    trackerId: e.trackerId,
    value: e.value,
    date: e.date,
    ...(e.note ? { note: e.note } : {}),
    ...(e.tags && e.tags.length ? { tags: e.tags } : {}),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

type SetUnset = { $set: Record<string, unknown>; $unset: Record<string, 1> };


export function buildUpdate(body: Record<string, unknown>): SetUnset {
  const update: SetUnset = { $set: {}, $unset: {} };
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    if (value === null) update.$unset[key] = 1;
    else if (key === 'archivedAt') update.$set[key] = new Date(value as string);
    else update.$set[key] = value;
  }
  return update;
}
