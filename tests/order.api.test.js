import request from "supertest";
import app from "../src/app.js";
import redis from "../src/lib/redis.js";

describe("Order API", () => {

    beforeAll(async () => {
        await redis.set("stock:product1", 5);
    });

    afterAll(async () => {
        await redis.quit();
    });

    test("POST /api/buy should succeed", async () => {
        const res = await request(app).get("/api/buy");

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Queued");
    });

    test("should return SOLD_OUT when stock is empty", async () => {
        await redis.set("stock:product1", 0);

        const res = await request(app).get("/api/buy");

        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Sold out");
    });

});