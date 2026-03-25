import express from 'express';
import { getMessage } from '../controllers/api.controller.js';
import { buyProductKafka } from '../controllers/kafkaOrder.controller.js';
import { buyProductBull } from '../controllers/order.controller.js';

const router = express.Router();

router.get('/', getMessage);
router.get('/buy', buyProductKafka);
router.get('/buy-bull', buyProductBull);

export default router;