import express from "express";
import cors from "cors";

// =======================
// 🔌 CORE DEPENDENCIES
// =======================

import redis from "./lib/redis.js";
import { keys } from "./services/flashSale.service.js";

// =======================
// 🔌 INFRA
// =======================

import { createKafkaProducer } from "./infra/kafka/producer.js";
import { createQueue } from "./infra/queue/queue.js";

// =======================
// 🧠 SERVICES
// =======================

import { createOrderService } from "./services/order.service.js";

// =======================
// 🎮 CONTROLLERS
// =======================

import { createOrderController } from "./controllers/order.controller.js";
import { getMessage } from "./controllers/api.controller.js";

// =======================
// 🚏 ROUTES
// =======================

import { createApiRoutes } from "./routes/api.routes.js";

// =======================
// 📊 BULL BOARD
// =======================

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

// =======================
// 🚀 APP INIT
// =======================

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  })
);

// =======================
// 🔌 INFRA INIT
// =======================

const producer = await createKafkaProducer();
const queue = createQueue(redis);

// =======================
// 🧠 SERVICE INIT
// =======================

const orderService = createOrderService({
  redis,
  producer,
  queue,
  keys
});

// =======================
// 🎮 CONTROLLER INIT
// =======================

const controller = createOrderController({
  orderService,
  redis
});

const apiController = { getMessage };

// =======================
// 🚏 ROUTES INIT
// =======================

app.use(
  "/api",
  createApiRoutes({
    controller,
    redis,
    apiController
  })
);

// =======================
// 📊 BULL BOARD (ADMIN UI)
// =======================

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter
});

app.use("/admin/queues", serverAdapter.getRouter());

// =======================
// 🧯 GLOBAL ERROR HANDLER (OPTIONAL 🔥)
// =======================

app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

// =======================
// 📦 EXPORT
// =======================

export default app;