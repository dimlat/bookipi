import { jest } from '@jest/globals';
import { createOrderService } from "../src/services/order.service.js";
import { AppError } from "../src/utils/AppError.js";

describe("Order Service", () => {

    let redisMock;
    let producerMock;
    let queueMock;
    let keys;
    let service;

    beforeEach(() => {
        redisMock = {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn(),
            decr: jest.fn()
        };

        producerMock = {
            send: jest.fn()
        };

        queueMock = {
            add: jest.fn()
        };

        keys = {
            userBought: (id) => `user:${id}`,
            stock: (id) => `stock:${id}`,
            lock: (id) => `lock:${id}`,
            rateLimit: (id) => `rate:${id}`
        };

        service = createOrderService({
            redis: redisMock,
            producer: producerMock,
            queue: queueMock,
            keys
        });
    });

    test("should process order via Kafka successfully", async () => {
        redisMock.get.mockResolvedValue(null);
        redisMock.set.mockResolvedValue("OK");
        redisMock.incr.mockResolvedValue(1);
        redisMock.decr.mockResolvedValue(5);

        await service.processOrder({
            userId: 1,
            productId: "product1",
            strategy: "kafka"
        });

        expect(producerMock.send).toHaveBeenCalled();
    });

    test("should throw ALREADY_BOUGHT", async () => {
        redisMock.get.mockResolvedValue("1");

        await expect(
            service.processOrder({
                userId: 1,
                productId: "product1",
                strategy: "kafka"
            })
        ).rejects.toThrow(AppError);
    });

    test("should throw SOLD_OUT", async () => {
        redisMock.get.mockResolvedValue(null);
        redisMock.set.mockResolvedValue("OK");
        redisMock.incr.mockResolvedValue(1);
        redisMock.decr.mockResolvedValue(-1);

        await expect(
            service.processOrder({
                userId: 1,
                productId: "product1",
                strategy: "kafka"
            })
        ).rejects.toThrow("Sold out");
    });

});