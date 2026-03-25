import mongoose from 'mongoose';
import { Kafka } from 'kafkajs';

await mongoose.connect('mongodb://mongodb:27017/shop');

const OrderSchema = new mongoose.Schema({
    userId: String,
    productId: String,
    createdAt: { type: Date, default: Date.now }
});

OrderSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Order = mongoose.model('Order', OrderSchema);

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
            // simpan ke Mongo
            console.log('ORDER_CREATED event received, saving to MongoDB...');
            console.log('Event data:', event);
            await Order.create(event);
        }
    }
});