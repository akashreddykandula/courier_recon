import axios from 'axios';
import { Worker } from 'bullmq';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { redisConnection } from '../config/redis.js';
import { discrepancyQueueName } from '../queues/discrepancyQueue.js';
import { Notification } from '../models/Notification.js';

await connectDb();

const worker = new Worker(
  discrepancyQueueName,
  async (job) => {
    const payload = {
      merchantId: job.data.merchantId,
      awbNumber: job.data.awbNumber,
      discrepancyType: job.data.discrepancyType,
      expected: job.data.expected,
      actual: job.data.actual,
      suggestedAction: job.data.suggestedAction
    };

    try {
      const response = await axios.post(env.webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      await Notification.create({
        awbNumber: payload.awbNumber,
        merchantId: payload.merchantId,
        discrepancyType: payload.discrepancyType,
        status: job.attemptsMade > 0 ? 'retried' : 'sent',
        payload,
        responseBody: response.data,
        attemptCount: job.attemptsMade + 1
      });
    } catch (error) {
      await Notification.create({
        awbNumber: payload.awbNumber,
        merchantId: payload.merchantId,
        discrepancyType: payload.discrepancyType,
        status: 'failed',
        payload,
        responseBody: error.response?.data || { message: error.message },
        attemptCount: job.attemptsMade + 1
      });

      throw error;
    }
  },
  {
    connection: redisConnection
  }
);

worker.on('ready', () => {
  console.log('Notification worker ready');
});

worker.on('failed', (job, error) => {
  console.error(`Notification job ${job?.id} failed:`, error.message);
});

