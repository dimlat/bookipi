import express from 'express';
import { getMessage } from '../controllers/api.controller.js';
import { buyProduct } from '../controllers/order.controller.js';

const router = express.Router();

router.get('/', getMessage);
router.get('/buy', buyProduct);

export default router;