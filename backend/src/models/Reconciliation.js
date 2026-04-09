import mongoose from 'mongoose';

const discrepancySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    expected: { type: mongoose.Schema.Types.Mixed, default: null },
    actual: { type: mongoose.Schema.Types.Mixed, default: null },
    tolerance: { type: mongoose.Schema.Types.Mixed, default: null },
    message: { type: String, required: true },
    suggestedAction: { type: String, required: true }
  },
  { _id: false }
);

const reconciliationSchema = new mongoose.Schema(
  {
    awbNumber: { type: String, required: true, unique: true, index: true },
    merchantId: { type: String, required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    settlementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settlement', default: null },
    status: {
      type: String,
      enum: ['MATCHED', 'DISCREPANCY', 'PENDING_REVIEW'],
      required: true,
      index: true
    },
    discrepancyTypes: { type: [String], default: [] },
    discrepancies: { type: [discrepancySchema], default: [] },
    lastRunAt: { type: Date, required: true },
    manualRun: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Reconciliation = mongoose.model('Reconciliation', reconciliationSchema);

