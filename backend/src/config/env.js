import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5050),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/courier_recon',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL || 'https://webhook.site/your-id',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
