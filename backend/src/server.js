import app from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { startReconciliationScheduler } from './schedulers/reconciliationScheduler.js';

const startServer = async () => {
  await connectDb();
  startReconciliationScheduler();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Backend running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
