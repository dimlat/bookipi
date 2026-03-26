import express from 'express';
import { getMessage } from '../controllers/api.controller.js';
import { buyProductKafka } from '../controllers/kafkaOrder.controller.js';
import { buyProductBull } from '../controllers/order.controller.js';
import Redis from 'ioredis';

const redis = new Redis({ host: 'redis' });
const router = express.Router();

router.get('/', getMessage);
router.get('/buy', buyProductKafka);
router.get('/buy-bull', buyProductBull);
router.get('/stock', async (req, res) => {
  const stock = await redis.get('stock:product1');
  res.send({ stock });
});

export default router;