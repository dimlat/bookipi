import express from 'express';
import { getMessage } from '../controllers/api.controller.js';
import { buyProduct } from '../controllers/kafkaOrder.controller.js';

const router = express.Router();

router.get('/', getMessage);
router.get('/buy', buyProduct);

export default router;