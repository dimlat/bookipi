# 🚀 Flash Sale System (Bookipi Case Study)

This project simulates a **high-concurrency flash sale system** designed to handle thousands of simultaneous purchase requests while maintaining **data consistency, performance, and scalability**.

---

## 🧠 Problem Statement

Flash sale systems face several critical challenges:

- 🔥 High concurrent requests (traffic spikes)
- ⚠️ Race conditions on stock updates
- ❌ Duplicate purchases from same user
- 🐢 Database bottlenecks under heavy load

This project demonstrates how to solve these problems using a **queue-based architecture**.

---

## 🏗️ Architecture Overview


Client
↓
NGINX (Load Balancer)
↓
Multiple Backend APIs
↓
Redis (Queue via BullMQ / Kafka)
↓
Worker
↓
MongoDB


---

## ⚙️ System Components

### Layer 1 — Infrastructure

- 🌐 NGINX → Load balancing across backend instances
- ⚙️ Backend (2 instances) → Handle incoming API requests
- 📦 Redis → Queue + caching
- 👷 Worker → Asynchronous job processor
- 🧠 MongoDB → Persistent storage
- 📊 Mongo Express → Database UI

---

### 🔄 Request Flow

1. Client sends purchase request
2. NGINX distributes traffic
3. Backend:
   - Checks stock in Redis
   - Pushes job to queue (BullMQ / Kafka)
4. Worker:
   - Processes job
   - Saves order to MongoDB
   - Updates Redis (latest buyers)

---

### 📖 Read Flow (Frontend / Admin)

1. Client requests purchase list
2. API fetches data from Redis
3. Returns latest buyers instantly

---

## 🚀 Why Queue-Based Architecture?

Without queue:
- ❌ DB overload
- ❌ Inconsistent stock
- ❌ High latency

With queue:
- ✅ Smooth traffic handling
- ✅ Consistent processing
- ✅ Scalable system

---

## ⚔️ BullMQ vs Kafka

### 📊 Performance Result

| Metric        | BullMQ | Kafka |
|--------------|--------|--------|
| Avg Latency  | 16.98 ms | 37.44 ms |
| Throughput   | ~5700 req/sec | ~2600 req/sec |

---

### 🧠 Decision

**BullMQ is chosen because:**

- ⚡ Lower latency
- 🧩 Simpler setup (no broker cluster)
- 🔁 Better for real-time job processing
- 🔗 Already using Redis

---

### 📌 When Kafka is Better

- Event streaming
- Large distributed systems
- Long-term message storage

---

## 🧪 Load Testing & Stress Testing

### ⚡ Autocannon (Quick Benchmark)

```bash
npx autocannon -c 100 -d 10 http://localhost:8080/api/buy-bull
📊 k6 (Advanced Testing)
docker compose run k6 run /scripts/k6.js
🎯 What We Validate
API stability under load
Queue performance
Worker throughput
Database consistency
🏁 Results (BullMQ)
⚡ ~5700 requests/sec
⏱️ Avg latency: 16ms
🔥 Stable under 100 concurrent users
🐳 How to Run
1. Install dependencies
npm install
2. Run Docker
docker compose up --build
3. Seed Data
docker exec -it bookipi-backend1-1 sh
node seed.js
4. Test API
# BullMQ
curl http://localhost:8080/api/buy-bull?user=1

# Kafka
curl http://localhost:8080/api/buy?user=1
5. Run Tests
docker exec -it bookipi-backend1-1 sh
npm run test
📊 Dashboard
MongoDB → http://localhost:8081
BullMQ → http://localhost:8080/admin/queues
Kafka → http://localhost:8082
🧠 Key Design Decisions
Redis used for both cache & queue
Worker separated from API → prevents blocking
Load balancer → horizontal scalability
Queue ensures order consistency
⚠️ Trade-offs
Redis is a single point of failure (no clustering yet)
BullMQ not suitable for long-term event storage
🚀 Future Improvements
Add rate limiting per user
Implement idempotency key
Use Redis Lua script for atomic stock decrement
Scale workers horizontally
Add Redis clustering
🎯 Expected Outcome
No duplicate purchases
Consistent stock handling
Low latency under high load
Scalable architecture
🧩 Conclusion

This project demonstrates how a queue-based architecture (BullMQ) significantly improves:

⚡ Performance
🔁 Consistency
📈 Scalability

Compared to Kafka in this use case, BullMQ provides a simpler and faster solution for real-time flash sale systems.

👨‍💻 Author Note

This project focuses on system design under high concurrency, simulating real-world scenarios like e-commerce flash sales.