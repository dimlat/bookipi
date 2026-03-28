import express from "express";

export const createApiRoutes = ({
  controller,
  redis,
  apiController
}) => {
  const router = express.Router();

  // basic
  router.get("/", apiController.getMessage);

  // order
  router.get("/buy", controller.buyProductViaKafka);
  router.get("/buy-bull", controller.buyProductViaBull);

  // stock
  router.get("/stock", async (req, res) => {
    const stock = await redis.get("stock:product1");
    res.send({ stock });
  });

  router.post("/stock", async (req, res) => {
    const { stock } = req.body;

    if (stock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    await redis.set("stock:product1", stock);

    res.json({
      message: "Stock updated",
      stock
    });
  });

  // flash sale
  router.post("/flash-sale", async (req, res) => {
    const { startAt, duration } = req.body;

    const endAt = startAt + duration;

    await redis.set(
      "flashsale:config",
      JSON.stringify({ startAt, endAt })
    );

    res.json({ startAt, endAt });
  });

  router.get("/flash-sale", async (req, res) => {
    const data = await redis.get("flashsale:config");

    if (!data) {
      return res.json({ startAt: null, endAt: null });
    }

    res.json(JSON.parse(data));
  });

  // purchases
  router.get("/purchases", async (req, res) => {
    const list = await redis.lrange("purchases", 0, 20);
    const parsed = list.map((item) => JSON.parse(item));
    res.json(parsed.reverse());
  });

  // misc
  router.get("/time", (req, res) => {
    res.json({ serverTime: Date.now() });
  });

  return router;
};