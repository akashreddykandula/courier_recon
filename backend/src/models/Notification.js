import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    awbNumber: { type: String, required: true, index: true },
    merchantId: { type: String, required: true, index: true },
    discrepancyType: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'failed', 'retried'],
      required: true
    },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    responseBody: { type: mongoose.Schema.Types.Mixed, default: null },
    attemptCount: { type: Number, default: 1, min: 1 },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);

