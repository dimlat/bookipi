import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: String,
    productId: String,
    createdAt: { type: Date, default: Date.now }
});

// biar gak duplicate index error di dev / hot reload
OrderSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);