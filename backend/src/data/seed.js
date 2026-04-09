import { connectDb } from '../config/db.js';
import { Order } from '../models/Order.js';
import { Settlement } from '../models/Settlement.js';
import { Reconciliation } from '../models/Reconciliation.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';
import { sha256 } from '../utils/hash.js';

await connectDb();

const orders = [
  {
    awbNumber: 'AWB1001',
    merchantId: 'M001',
    courierPartner: 'Delhivery',
    orderStatus: 'DELIVERED',
    codAmount: 1200,
    declaredWeight: 1.2,
    orderDate: new Date('2026-03-15'),
    deliveryDate: new Date('2026-03-18')
  },
  {
    awbNumber: 'AWB1002',
    merchantId: 'M001',
    courierPartner: 'Shiprocket',
    orderStatus: 'DELIVERED',
    codAmount: 900,
    declaredWeight: 0.8,
    orderDate: new Date('2026-03-14'),
    deliveryDate: new Date('2026-03-16')
  },
  {
    awbNumber: 'AWB1003',
    merchantId: 'M002',
    courierPartner: 'Xpressbees',
    orderStatus: 'DELIVERED',
    codAmount: 1500,
    declaredWeight: 2,
    orderDate: new Date('2026-03-10'),
    deliveryDate: new Date('2026-03-13')
  },
  {
    awbNumber: 'AWB1004',
    merchantId: 'M003',
    courierPartner: 'Ecom Express',
    orderStatus: 'DELIVERED',
    codAmount: 700,
    declaredWeight: 1,
    orderDate: new Date('2026-03-10'),
    deliveryDate: new Date('2026-03-11')
  },
  {
    awbNumber: 'AWB1005',
    merchantId: 'M003',
    courierPartner: 'Delhivery',
    orderStatus: 'SHIPPED',
    codAmount: 650,
    declaredWeight: 0.7,
    orderDate: new Date('2026-03-20'),
    deliveryDate: null
  }
];

const rawSettlements = [
  {
    awbNumber: 'AWB1001',
    settledCodAmount: 1200,
    chargedWeight: 1.21,
    forwardCharge: 65,
    rtoCharge: 0,
    codHandlingFee: 10,
    settlementDate: new Date('2026-03-24'),
    batchId: 'BATCH-001'
  },
  {
    awbNumber: 'AWB1002',
    settledCodAmount: 860,
    chargedWeight: 0.8,
    forwardCharge: 55,
    rtoCharge: 0,
    codHandlingFee: 9,
    settlementDate: new Date('2026-03-28'),
    batchId: 'BATCH-001'
  },
  {
    awbNumber: 'AWB1003',
    settledCodAmount: 1500,
    chargedWeight: 2.5,
    forwardCharge: 80,
    rtoCharge: 0,
    codHandlingFee: 12,
    settlementDate: new Date('2026-03-18'),
    batchId: 'BATCH-001'
  },
  {
    awbNumber: 'AWB1004',
    settledCodAmount: 700,
    chargedWeight: 1,
    forwardCharge: 50,
    rtoCharge: 75,
    codHandlingFee: 8,
    settlementDate: new Date('2026-03-29'),
    batchId: 'BATCH-001'
  },
  {
    awbNumber: 'AWB1004',
    settledCodAmount: 700,
    chargedWeight: 1,
    forwardCharge: 50,
    rtoCharge: 75,
    codHandlingFee: 8,
    settlementDate: new Date('2026-03-29'),
    batchId: 'BATCH-002'
  }
];

const batchHashes = {
  'BATCH-001': sha256(
    JSON.stringify(rawSettlements.filter((item) => item.batchId === 'BATCH-001'))
  ),
  'BATCH-002': sha256(
    JSON.stringify(rawSettlements.filter((item) => item.batchId === 'BATCH-002'))
  )
};

const settlements = rawSettlements.map((item) => ({
  ...item,
  batchHash: batchHashes[item.batchId],
  status: 'UPLOADED'
}));

await Promise.all([
  Order.deleteMany({}),
  Settlement.deleteMany({}),
  Reconciliation.deleteMany({}),
  Job.deleteMany({}),
  Notification.deleteMany({})
]);

await Order.insertMany(orders);
await Settlement.insertMany(settlements);

console.log('Seed data inserted successfully');
process.exit(0);

