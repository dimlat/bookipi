// src/controllers/order.controller.js

export const createOrderController = ({ orderService, redis }) => {

    const createHandler = ({ strategy, successMessage }) => {
        return async (req, res) => {
            try {
                const userId =
                    req.query.user || (await redis.incr("global:user:id"));

                const productId = req.query.product || "product1";

                await orderService.processOrder({
                    userId,
                    productId,
                    strategy
                });

                return res.send(successMessage);

            } catch (err) {
                return res
                    .status(err.status || 500)
                    .send(err.message || "Internal server error");
            }
        };
    };

    return {
        buyProductViaKafka: createHandler({
            strategy: "kafka",
            successMessage: "Queued via Kafka"
        }),

        buyProductViaBull: createHandler({
            strategy: "bull",
            successMessage: "Queued via Bull"
        })
    };
};