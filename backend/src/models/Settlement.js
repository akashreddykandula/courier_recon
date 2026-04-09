import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    awbNumber: { type: String, required: true, index: true },
    settledCodAmount: { type: Number, required: true, min: 0 },
    chargedWeight: { type: Number, required: true, min: 0 },
    forwardCharge: { type: Number, required: true, min: 0 },
    rtoCharge: { type: Number, default: 0, min: 0 },
    codHandlingFee: { type: Number, default: 0, min: 0 },
    settlementDate: { type: Date, required: true },
    batchId: { type: String, required: true, index: true },
    batchHash: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['UPLOADED', 'MATCHED', 'DISCREPANCY', 'PENDING_REVIEW'],
      default: 'UPLOADED'
    }
  },
  { timestamps: true }
);

settlementSchema.index({ awbNumber: 1, settlementDate: 1, batchId: 1 }, { unique: true });

export const Settlement = mongoose.model('Settlement', settlementSchema);

