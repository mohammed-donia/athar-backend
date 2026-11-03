import mongoose, { type ClientSession } from 'mongoose';

export async function withTransaction<T>(
  fn: (session: ClientSession | null) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTxnUnsupported =
      /Transaction numbers are only allowed/i.test(msg) ||
      /replica set/i.test(msg) ||
      /not supported/i.test(msg);

    if (!isTxnUnsupported) throw err;

    return fn(null);
  } finally {
    await session.endSession();
  }
}
