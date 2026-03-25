import { keys } from '../services/flashSale.service.js';
import { Kafka } from 'kafkajs';


import Redis from 'ioredis';

const redis = new Redis({ host: 'redis' });

const kafka = new Kafka({
    clientId: 'app',
    brokers: ['kafka:9092']
});

const producer = kafka.producer();
const connectProducer = async () => {
    console.log('Connecting to Kafka...');
    try {
        await producer.connect();
    } catch (e) {
        console.log('Retrying Kafka connect...');
        await new Promise(r => setTimeout(r, 2000));
        return connectProducer();
    }
};

await connectProducer();
export const buyProductKafka = async (req, res) => {
    console.log('Received order request for Kafka:', req.query);
    const userId = req.query.user || Math.floor(Math.random() * 1000000);
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

    await producer.send({
        topic: 'orders',
        messages: [
            {
                value: JSON.stringify({
                    type: 'ORDER_CREATED',
                    userId,
                    productId
                })
            }
        ]
    });

    res.send('Queued via Kafka');
};