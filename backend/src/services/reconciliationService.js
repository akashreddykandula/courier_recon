import { Order } from '../models/Order.js';
import { Settlement } from '../models/Settlement.js';
import { Reconciliation } from '../models/Reconciliation.js';
import { Job } from '../models/Job.js';
import { discrepancyQueue } from '../queues/discrepancyQueue.js';
import { buildSuggestedAction, getCodTolerance, getWeightVariancePercent } from '../utils/reconciliation.js';
import { daysBetween } from '../utils/date.js';

const buildDiscrepancy = ({ type, expected, actual, tolerance, message }) => ({
  type,
  expected,
  actual,
  tolerance,
  message,
  suggestedAction: buildSuggestedAction(type)
});

const evaluateRules = ({ order, settlement, duplicateCount, runTime }) => {
  const discrepancies = [];

  if (!order || !settlement) {
    return discrepancies;
  }

  const codTolerance = getCodTolerance(order.codAmount);
  const codDiff = Math.abs((settlement.settledCodAmount || 0) - (order.codAmount || 0));
  if (codDiff > codTolerance) {
    discrepancies.push(
      buildDiscrepancy({
        type: 'COD_MISMATCH',
        expected: order.codAmount,
        actual: settlement.settledCodAmount,
        tolerance: codTolerance,
        message: `COD mismatch of Rs.${codDiff.toFixed(2)} exceeds allowed tolerance.`
      })
    );
  }

  const weightVariance = getWeightVariancePercent(order.declaredWeight, settlement.chargedWeight);
  if (weightVariance > 10) {
    discrepancies.push(
      buildDiscrepancy({
        type: 'WEIGHT_MISMATCH',
        expected: order.declaredWeight,
        actual: settlement.chargedWeight,
        tolerance: '10%',
        message: `Charged weight varies by ${weightVariance.toFixed(2)}% from declared weight.`
      })
    );
  }

  if (order.orderStatus === 'DELIVERED' && Number(settlement.rtoCharge || 0) > 0) {
    discrepancies.push(
      buildDiscrepancy({
        type: 'RTO_CHARGE_ON_DELIVERED',
        expected: 0,
        actual: settlement.rtoCharge,
        tolerance: 0,
        message: 'Delivered order should not carry an RTO charge.'
      })
    );
  }

  const settlementDelay = daysBetween(order.deliveryDate || order.orderDate, settlement.settlementDate);
  if (settlementDelay !== null && settlementDelay > 14) {
    discrepancies.push(
      buildDiscrepancy({
        type: 'OVERDUE_SETTLEMENT',
        expected: '<= 14 days',
        actual: `${settlementDelay} days`,
        tolerance: '14 days',
        message: 'Settlement arrived later than the 14-day SLA.'
      })
    );
  }

  if (duplicateCount > 1) {
    discrepancies.push(
      buildDiscrepancy({
        type: 'DUPLICATE_SETTLEMENT',
        expected: 1,
        actual: duplicateCount,
        tolerance: 1,
        message: 'Multiple settlement records exist for the same AWB.'
      })
    );
  }

  return discrepancies;
};

const publishDiscrepancies = async (merchantId, awbNumber, discrepancies) => {
  await Promise.all(
    discrepancies.map((discrepancy) =>
      discrepancyQueue.add('send-discrepancy-notification', {
        merchantId,
        awbNumber,
        discrepancyType: discrepancy.type,
        expected: discrepancy.expected,
        actual: discrepancy.actual,
        suggestedAction: discrepancy.suggestedAction
      })
    )
  );
};

export const runReconciliation = async ({ triggerSource = 'MANUAL' } = {}) => {
  const runTime = new Date();
  const settlements = await Settlement.find().sort({ settlementDate: -1 }).lean();
  const orders = await Order.find().lean();

  const orderMap = new Map(orders.map((order) => [order.awbNumber, order]));
  const settlementGroups = settlements.reduce((acc, settlement) => {
    const list = acc.get(settlement.awbNumber) || [];
    list.push(settlement);
    acc.set(settlement.awbNumber, list);
    return acc;
  }, new Map());

  let discrepancyCount = 0;
  let matchedCount = 0;
  let pendingReviewCount = 0;
  const processedAwbs = new Set();

  for (const [awbNumber, groupedSettlements] of settlementGroups.entries()) {
    const settlement = groupedSettlements[0];
    const order = orderMap.get(awbNumber);
    const duplicateCount = groupedSettlements.length;
    let status = 'MATCHED';
    let discrepancies = [];

    if (!order || !settlement) {
      status = 'PENDING_REVIEW';
      pendingReviewCount += 1;
      discrepancies = [
        buildDiscrepancy({
          type: 'PENDING_REVIEW',
          expected: order ? 'Settlement record' : 'Order record',
          actual: order ? 'Missing settlement' : 'Missing order',
          tolerance: null,
          message: 'Missing order or settlement record for reconciliation.'
        })
      ];
    } else {
      discrepancies = evaluateRules({ order, settlement, duplicateCount, runTime });

      if (discrepancies.length > 0) {
        status = 'DISCREPANCY';
        discrepancyCount += 1;
        await publishDiscrepancies(order.merchantId, awbNumber, discrepancies);
      } else {
        matchedCount += 1;
      }
    }

    await Settlement.updateMany(
      { awbNumber },
      {
        $set: {
          status: status === 'MATCHED' ? 'MATCHED' : status
        }
      }
    );

    await Reconciliation.findOneAndUpdate(
      { awbNumber },
      {
        awbNumber,
        merchantId: order?.merchantId || 'UNKNOWN',
        orderId: order?._id || null,
        settlementId: settlement?._id || null,
        status,
        discrepancyTypes: discrepancies.map((item) => item.type),
        discrepancies,
        lastRunAt: runTime,
        manualRun: triggerSource === 'MANUAL'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    processedAwbs.add(awbNumber);
  }

  for (const order of orders) {
    if (processedAwbs.has(order.awbNumber)) {
      continue;
    }

    pendingReviewCount += 1;

    await Reconciliation.findOneAndUpdate(
      { awbNumber: order.awbNumber },
      {
        awbNumber: order.awbNumber,
        merchantId: order.merchantId,
        orderId: order._id,
        settlementId: null,
        status: 'PENDING_REVIEW',
        discrepancyTypes: ['PENDING_REVIEW'],
        discrepancies: [
          buildDiscrepancy({
            type: 'PENDING_REVIEW',
            expected: 'Settlement record',
            actual: 'Missing settlement',
            tolerance: null,
            message: 'Order exists but settlement is unavailable for reconciliation.'
          })
        ],
        lastRunAt: runTime,
        manualRun: triggerSource === 'MANUAL'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const job = await Job.create({
    runTime,
    processedCount: orders.length + settlements.length,
    discrepancyCount,
    matchedCount,
    pendingReviewCount,
    triggerSource,
    status: 'SUCCESS'
  });

  return {
    jobId: job._id,
    runTime,
    processedCount: orders.length + settlements.length,
    discrepancyCount,
    matchedCount,
    pendingReviewCount
  };
};

