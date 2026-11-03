import { z } from 'zod';
import { CATEGORIES, PERIODS } from '../models/Tracker.js';

const id = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'معرّف غير صالح');

const isoDateTime = z.string().datetime();

const goal = z.object({
  target: z.number().finite().positive().max(1e9),
  period: z.enum(PERIODS),
});

export const trackerCreate = z.object({
  id,
  name: z.string().trim().min(1, 'الاسم مطلوب').max(100),
  description: z.string().trim().max(500).optional(),
  category: z.enum(CATEGORIES),
  unit: z.string().trim().min(1, 'الوحدة مطلوبة').max(30),
  type: z.literal('number').default('number'),
  icon: z.string().max(16).optional(),
  color: z.string().max(20).optional(),
  goal: goal.optional(),
  archivedAt: isoDateTime.optional(),
  createdAt: isoDateTime.optional(), 
});

export const trackerUpdate = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  category: z.enum(CATEGORIES).optional(),
  unit: z.string().trim().min(1).max(30).optional(),
  icon: z.string().max(16).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  goal: goal.nullable().optional(),
  archivedAt: isoDateTime.nullable().optional(),
});

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'التاريخ لازم يكون YYYY-MM-DD');
const note = z.string().trim().max(500);
const tags = z.array(z.string().trim().min(1).max(30)).max(20);

export const entryCreate = z.object({
  id,
  trackerId: id,
  value: z.number().finite().min(0).max(1e9),
  date,
  note: note.optional(),
  tags: tags.optional(),
  createdAt: isoDateTime.optional(), 
});

export const entryUpdate = z.object({
  value: z.number().finite().min(0).max(1e9).optional(),
  date: date.optional(),
  note: note.nullable().optional(),
  tags: tags.nullable().optional(),
});

export const registerBody = z.object({
  name: z.string().trim().min(1, 'الاسم مطلوب').max(60),
  email: z.string().trim().toLowerCase().email('البريد الإلكتروني غير صالح').max(254),
  password: z
    .string()
    .min(8, 'كلمة السر لازم تكون 8 أحرف على الأقل')
    .max(72, 'كلمة السر طويلة كثير'),
});

export const loginBody = z.object({
  email: z.string().trim().toLowerCase().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1).max(72),
});

export const importBody = z.object({
  trackers: z.array(trackerCreate).max(500),
  entries: z.array(entryCreate).max(50000),
});
