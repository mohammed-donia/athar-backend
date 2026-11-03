import { Schema, model, type Types } from 'mongoose';

export const CATEGORIES = [
  'finance',
  'education',
  'health',
  'fitness',
  'reading',
  'work',
  'entertainment',
  'personal',
  'other',
] as const;

export const PERIODS = ['daily', 'weekly', 'monthly'] as const;

export interface ITracker {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  id: string;
  name: string;
  description?: string;
  category: (typeof CATEGORIES)[number];
  unit: string;
  type: 'number';
  icon?: string;
  color?: string;
  goal?: { target: number; period: (typeof PERIODS)[number] };
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema(
  {
    target: { type: Number, required: true, min: 0 },
    period: { type: String, enum: PERIODS, required: true },
  },
  { _id: false }
);

const trackerSchema = new Schema<ITracker>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    category: { type: String, enum: CATEGORIES, required: true },
    unit: { type: String, required: true, trim: true, maxlength: 30 },
    type: { type: String, enum: ['number'], default: 'number' },
    icon: { type: String, maxlength: 16 },
    color: { type: String, maxlength: 20 },
    goal: { type: goalSchema },
    archivedAt: { type: Date },
  },
  { timestamps: true, id: false }
);

trackerSchema.index({ userId: 1, id: 1 }, { unique: true });

export const Tracker = model<ITracker>('Tracker', trackerSchema);
