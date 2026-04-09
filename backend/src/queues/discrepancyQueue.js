import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const discrepancyQueueName = 'discrepancy-notifications';

export const discrepancyQueue = new Queue(discrepancyQueueName, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

