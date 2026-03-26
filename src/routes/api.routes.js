import express from 'express';
import { getMessage } from '../controllers/api.controller.js';
import { buyProductKafka } from '../controllers/kafkaOrder.controller.js';
import { buyProductBull } from '../controllers/order.controller.js';
import redis from "../lib/redis.js";

const router = express.Router();

router.get('/', getMessage);
router.get('/buy', buyProductKafka);
router.get('/buy-bull', buyProductBull);
router.get('/stock', async (req, res) => {
  const stock = await redis.get('stock:product1');
  res.send({ stock });
});
router.get('/time', (req, res) => {
  res.json({ serverTime: Date.now() });
});

router.post('/flash-sale', async (req, res) => {
  const { startAt, duration } = req.body;

  const endAt = startAt + duration;

  await redis.set(
    'flashsale:config',
    JSON.stringify({ startAt, endAt })
  );

  res.json({ startAt, endAt });
});

router.get('/flash-sale', async (req, res) => {
  const data = await redis.get('flashsale:config');

  if (!data) {
    return res.json({ startAt: null, endAt: null });
  }

  res.json(JSON.parse(data));
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

export default router;