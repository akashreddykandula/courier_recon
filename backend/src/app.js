import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import settlementRoutes from './routes/settlementRoutes.js';
import reconciliationRoutes from './routes/reconciliationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Courier reconciliation API is healthy.' });
});

app.use('/api/settlements', settlementRoutes);
app.use('/api/reconciliation', reconciliationRoutes);

app.use(errorHandler);

export default app;

