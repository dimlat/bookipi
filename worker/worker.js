import { Worker } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';

await mongoose.connect('mongodb://mongodb:27017/shop');

const OrderSchema = new mongoose.Schema({
  userId: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

console.log("🚀 Worker starting...");

const redis = new Redis({ host: 'redis' });

const worker = new Worker(
    'orders',
    async job => {
        console.log(`🔥 Processing order for ${job.data.userId}`);

        // DB writing
        await Order.create({ userId: job.data.userId });
    },
    { connection: redis }
);

// 👇 Tambahin ini
worker.on('ready', () => {
    console.log('🟢 Worker ready (connected to Redis)');
});

worker.on('completed', job => {
    console.log(`✅ Done job ${job.id}`);
});

worker.on('failed', (job, err) => {
    console.log(`❌ Failed job ${job?.id}`, err);
});

worker.on('error', err => {
    console.error('💥 Worker error:', err);
});