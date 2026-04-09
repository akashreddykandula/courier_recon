import { Router } from 'express';
import {
  getDashboardSummary,
  getJobLogs,
  getNotificationLogs,
  getReconciliations,
  triggerReconciliation
} from '../controllers/reconciliationController.js';

const router = Router();

router.post('/run', triggerReconciliation);
router.get('/results', getReconciliations);
router.get('/dashboard', getDashboardSummary);
router.get('/jobs', getJobLogs);
router.get('/notifications', getNotificationLogs);

export default router;

