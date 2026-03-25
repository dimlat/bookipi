import { Worker } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';

import { keys } from '../src/services/flashSale.service.js';

await mongoose.connect('mongodb://mongodb:27017/shop');

const OrderSchema = new mongoose.Schema({
    userId: String,
    productId: String,
    createdAt: { type: Date, default: Date.now }
});

OrderSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Order = mongoose.model('Order', OrderSchema);

console.log("🚀 Worker starting...");

const redis = new Redis({
    host: 'redis',
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});
const worker = new Worker(
    'orders',
    async job => {
        console.log(`🔥 Processing order for ${job.data.userId}`);

        /**
         * To simulate real-world conditions, we randomly throw an error to test the retry mechanism.
         */
        // 🎲 50% gagal
        // if (Math.random() < 0.8) {
        //     throw new Error('💥 Random failure');
        // }

        // DB writing
        try {
            const newOrder = await Order.create({ userId: job.data.userId, productId: job.data.productId });
        } catch (error) {
            if (error.code === 11000) {
                console.log('⚠️ Duplicate DB insert prevented');
                return;
            }
            throw error;
        }

        const userKey = keys.userBought(job.data.userId);
        // tandai user sudah beli
        await redis.set(userKey, '1', 'EX', 3600);

        // RETURN hasilnya agar muncul di dashboard
        return {
            orderId: newOrder._id, // atau newOrder.id
            message: "Order successfully created in DB"
        };
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
    if (job.attemptsMade >= 3) {
        console.log(`💀 Dead job ${job.id}`);
    } else {
        console.log(`⚠️ Failed job ${job.id}, retrying... (attempt ${job.attemptsMade})`);
    }
});

worker.on('error', err => {
    console.error('💥 Worker error:', err);
});