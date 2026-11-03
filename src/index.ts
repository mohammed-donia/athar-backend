import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config.js';

async function main() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log('✓ متصل بـ MongoDB');
  await mongoose.connection.syncIndexes();

  const app = createApp();
   const port = process.env.PORT || config.port;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`✓ السيرفر شغال على http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('فشل تشغيل السيرفر:', err);
  process.exit(1);
});
