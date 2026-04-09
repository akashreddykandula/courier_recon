import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    awbNumber: { type: String, required: true, unique: true, index: true },
    merchantId: { type: String, required: true, index: true },
    courierPartner: { type: String, required: true },
    orderStatus: {
      type: String,
      enum: ['CREATED', 'SHIPPED', 'DELIVERED', 'RTO', 'CANCELLED'],
      required: true
    },
    codAmount: { type: Number, required: true, min: 0 },
    declaredWeight: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, required: true },
    deliveryDate: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);

