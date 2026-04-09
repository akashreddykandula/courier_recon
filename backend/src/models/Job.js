import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      enum: ['RECONCILIATION'],
      default: 'RECONCILIATION'
    },
    runTime: { type: Date, required: true },
    processedCount: { type: Number, required: true, min: 0 },
    discrepancyCount: { type: Number, required: true, min: 0 },
    matchedCount: { type: Number, default: 0, min: 0 },
    pendingReviewCount: { type: Number, default: 0, min: 0 },
    triggerSource: {
      type: String,
      enum: ['CRON', 'MANUAL'],
      required: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true
    },
    errorMessage: { type: String, default: null }
  },
  { timestamps: true }
);

export const Job = mongoose.model('Job', jobSchema);

