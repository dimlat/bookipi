import { Worker } from 'bullmq';
import redis from "../src/lib/redis.js";
import { keys } from '../src/services/flashSale.service.js';
import { connectDB } from '../src/config/db.js';
import Order from '../src/models/Order.js';

console.log("🚀 Worker starting...");

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
            await connectDB();
            await Order.create({ userId: job.data.userId, productId: job.data.productId });
            const userKey = keys.userBought(job.data.userId);
            // tandai user sudah beli
            await redis.set(userKey, '1', 'EX', 3600);
            await redis.lpush('purchases', JSON.stringify({
                userId: job.data.userId,
                time: new Date().toISOString()
            }));
        } catch (error) {
            if (error.code === 11000) {
                console.log('⚠️ Duplicate DB insert prevented');
                return;
            }
            throw error;
        }

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

    // 🔥 ini yang kamu mau
    console.error('❌ Error message:', err.message);
    console.error('📦 Job data:', job.data);
    console.error('🧵 Stack trace:', err.stack);
});

worker.on('error', err => {
    console.error('💥 Worker error:', err);
});