import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import express from 'express';
import apiRoutes from './routes/api.routes.js';
import cors from 'cors';
import redis from "./lib/redis.js";

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

const queue = new Queue('orders', { connection: redis });

// setup server adapter
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// init bull board
createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter,
});

app.use('/api', apiRoutes);
// mount ke express
app.use('/admin/queues', serverAdapter.getRouter());

export default app;