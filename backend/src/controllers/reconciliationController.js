import { asyncHandler } from '../utils/asyncHandler.js';
import { runReconciliation } from '../services/reconciliationService.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';
import { Reconciliation } from '../models/Reconciliation.js';

export const triggerReconciliation = asyncHandler(async (req, res) => {
  const result = await runReconciliation({ triggerSource: 'MANUAL' });

  res.json({
    success: true,
    message: 'Reconciliation completed successfully.',
    data: result
  });
});

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [matched, discrepancy, pendingReview, jobs, notifications] = await Promise.all([
    Reconciliation.countDocuments({ status: 'MATCHED' }),
    Reconciliation.countDocuments({ status: 'DISCREPANCY' }),
    Reconciliation.countDocuments({ status: 'PENDING_REVIEW' }),
    Job.find().sort({ runTime: -1 }).limit(10).lean(),
    Notification.find().sort({ timestamp: -1 }).limit(20).lean()
  ]);

  res.json({
    success: true,
    data: {
      counts: { matched, discrepancy, pendingReview },
      jobs,
      notifications
    }
  });
});

export const getJobLogs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().sort({ runTime: -1 }).limit(10).lean();

  res.json({
    success: true,
    data: jobs
  });
});

export const getNotificationLogs = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ timestamp: -1 }).limit(20).lean();

  res.json({
    success: true,
    data: notifications
  });
});

export const getReconciliations = asyncHandler(async (req, res) => {
  const { status, merchantId, search } = req.query;
  const filter = {};

  if (status && status !== 'ALL') {
    filter.status = status;
  }

  if (merchantId) {
    filter.merchantId = merchantId;
  }

  if (search) {
    filter.awbNumber = { $regex: search, $options: 'i' };
  }

  const records = await Reconciliation.find(filter)
    .sort({ updatedAt: -1 })
    .limit(200)
    .populate('orderId')
    .populate('settlementId')
    .lean();

  res.json({
    success: true,
    data: records
  });
});
