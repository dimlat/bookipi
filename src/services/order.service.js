import { AppError } from "../utils/AppError.js";

export const createOrderService = ({ redis, producer, queue, keys }) => {

    const validateAndReserve = async ({ userId, productId }) => {
        const userKey = keys.userBought(userId);
        const stockKey = keys.stock(productId);

        if (await redis.get(userKey)) {
            throw new AppError("ALREADY_BOUGHT", "Already bought");
        }

        const lock = await redis.set(keys.lock(userId), "1", "NX", "EX", 10);
        if (!lock) {
            throw new AppError("ALREADY_ORDERED", "Already ordered");
        }

        const count = await redis.incr(keys.rateLimit(userId));
        if (count > 5) {
            throw new AppError("RATE_LIMIT", "Too many requests", 429);
        }

        const stock = await redis.decr(stockKey);
        if (stock < 0) {
            await redis.incr(stockKey);
            throw new AppError("SOLD_OUT", "Sold out");
        }
    };

    const publishKafka = async ({ userId, productId }) => {
        await producer.send({
            topic: "orders",
            messages: [
                {
                    value: JSON.stringify({
                        type: "ORDER_CREATED",
                        userId,
                        productId
                    })
                }
            ]
        });
    };

    const publishBull = async ({ userId }) => {
        await queue.add(
            "order",
            { userId },
            { attempts: 3, backoff: 1000 }
        );
    };

    return {
        processOrder: async ({ userId, productId, strategy }) => {
            await validateAndReserve({ userId, productId });

            if (strategy === "kafka") {
                await publishKafka({ userId, productId });
            } else if (strategy === "bull") {
                await publishBull({ userId });
            } else {
                throw new Error("Unknown strategy");
            }

            return { success: true };
        }
    };
};