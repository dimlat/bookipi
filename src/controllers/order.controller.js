import { keys } from '../services/flashSale.service.js';

import Redis from 'ioredis';
import { Queue } from 'bullmq';

const redis = new Redis({ host: 'redis' });
const queue = new Queue('orders', { connection: redis });

export const buyProduct = async (req, res) => {
    const userId = req.query.user || 'anon';
    const userKey = keys.userBought(userId);

    const productId = req.query.product || 'product1';
    const stockKey = keys.stock(productId);

    const alreadyBought = await redis.get(userKey);

    if (alreadyBought) {
        return res.status(400).send('Already bought');
    }

    // 1 user = 1 order
    const lock = await redis.set(
        keys.lock(userId),
        '1',
        'NX',
        'EX',
        10
    );

    if (!lock) {
        return res.status(400).send('Already ordered');
    }

    // rate limit
    const count = await redis.incr(keys.rateLimit(userId));
    if (count > 5) {
        return res.status(429).send('Too many requests');
    }

    // stock check
    const stock = await redis.decr(stockKey);

    if (stock < 0) {
        await redis.incr(stockKey);
        return res.status(400).send('Sold out');
    }

    /* queue tanpa retry
    await queue.add('order', { userId });
    */

    // queue dengan retry
    await queue.add('order', { userId }, { attempts: 3, backoff: 1000 });

    res.send('Order queued');
};