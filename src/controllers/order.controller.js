import Redis from 'ioredis';
import { Queue } from 'bullmq';

const redis = new Redis({ host: 'redis' });
const queue = new Queue('orders', { connection: redis });

export const buyProduct = async (req, res) => {
    const userId = req.query.user || 'anon';

    // 1 user = 1 order
    const lock = await redis.set(
        `lock:${userId}`,
        '1',
        'NX',
        'EX',
        10
    );

    if (!lock) {
        return res.status(400).send('Already ordered');
    }

    // rate limit
    const count = await redis.incr(`req:${userId}`);
    if (count > 5) {
        return res.status(429).send('Too many requests');
    }

    // stock check
    const stock = await redis.decr('stock:product1');

    if (stock < 0) {
        await redis.incr('stock:product1');
        return res.status(400).send('Sold out');
    }

    // queue
    await queue.add('order', { userId });

    res.send('Order queued');
};