import { Kafka } from 'kafkajs';
import { keys } from '../src/services/flashSale.service.js';
import { connectDB } from '../src/config/db.js';
import redis from "../src/lib/redis.js";

import Order from '../src/models/Order.js';

const kafka = new Kafka({
    clientId: 'app',
    brokers: ['kafka:9092']
});
const consumer = kafka.consumer({ groupId: 'order-group' });

await consumer.connect();
console.log("🟢 Kafka consumer connected");

const connectTopic = async () => {
    console.log('Connecting kafka topic...');
    try {
        await consumer.subscribe({ topic: 'orders', fromBeginning: true });
    } catch (e) {
        console.log('Retrying topic connect...');
        await new Promise(r => setTimeout(r, 2000));
        return connectTopic();
    }
};

await connectTopic();

await consumer.run({
    eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value.toString());

        console.log('📥 Event:', event);

        if (event.type === 'ORDER_CREATED') {
            await connectDB();
            
            // simpan ke Mongo
            await Order.create(event);
            const userKey = keys.userBought(event.userId);
            // tandai user sudah beli
            await redis.set(userKey, '1', 'EX', 3600);
            const order = {
                userId: event.userId,
            };

            // simpan ke Redis list
            await redis.lpush('purchases', JSON.stringify(order));
        }
    }
});