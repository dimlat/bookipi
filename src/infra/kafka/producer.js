import { Kafka } from "kafkajs";

export const createKafkaProducer = async () => {
    const kafka = new Kafka({
        clientId: "app",
        brokers: ["kafka:9092"]
    });

    const producer = kafka.producer();

    const connect = async () => {
        try {
            console.log("Connecting to Kafka...");
            await producer.connect();
            console.log("Kafka connected");
        } catch (e) {
            console.log("Retrying Kafka...");
            await new Promise((r) => setTimeout(r, 2000));
            return connect();
        }
    };

    await connect();

    return producer;
};