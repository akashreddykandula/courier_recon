import cron from 'node-cron';
import { runReconciliation } from '../services/reconciliationService.js';
import { Job } from '../models/Job.js';

export const startReconciliationScheduler = () => {
  cron.schedule(
    '0 2 * * *',
    async () => {
      try {
        await runReconciliation({ triggerSource: 'CRON' });
      } catch (error) {
        await Job.create({
          runTime: new Date(),
          processedCount: 0,
          discrepancyCount: 0,
          matchedCount: 0,
          pendingReviewCount: 0,
          triggerSource: 'CRON',
          status: 'FAILED',
          errorMessage: error.message
        });
      }
    },
    {
      timezone: 'Asia/Kolkata'
    }
  );
};

