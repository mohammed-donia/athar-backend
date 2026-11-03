import { Schema, model, type Types } from 'mongoose';

export interface IEntry {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  id: string;
  trackerId: string;
  value: number;
  date: string;
  note?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const entrySchema = new Schema<IEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    id: { type: String, required: true },
    trackerId: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: String, required: true },
    note: { type: String, maxlength: 500 },
    tags: { type: [String], default: undefined },
  },
  { timestamps: true, id: false }
);

entrySchema.index({ userId: 1, id: 1 }, { unique: true });
entrySchema.index({ userId: 1, trackerId: 1 });

export const Entry = model<IEntry>('Entry', entrySchema);
