import { Queue } from "bullmq";

export const createQueue = (redis) => {
    return new Queue("orders", { connection: redis });
};