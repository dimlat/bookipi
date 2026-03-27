Github URL: https://github.com/dimlat/bookipi
### HOW TO RUN Docker
in root run docker compose up --build
### HOW TO RUN Frontend
go to frontend folder, and type npm start
### you can seed data to Redis by going to (once docker up)
docker exec -it loadbalancer-backend1-1 sh
node seed.js
### then you can curl this
curl --location 'http://localhost:8080/api/buy?user=aria' -> via Kafka
curl --location 'http://localhost:8080/api/buy-bull?user=ari' -> via BullMQ

## You can see the diagram in root called SystemDiagramBullMQVersion.png

# System Diagram BullMQ Version
## Layer 1 — Docker Environment (big box)
🐳 Docker Network
│
├── 🌐 NGINX (Load Balancer)
├── ⚙️ Backend 1 (API)
├── ⚙️ Backend 2 (API)
├── 📦 Redis
├── 👷 Worker (BullMQ)
├── 🧠 MongoDB
└── 📊 Mongo Express

## Layer 2 — Request Flow
👤 Client
   │
   ▼
🌐 NGINX (Load Balancer)
   │
   ▼
⚙️ API (Backend1 / Backend2)
   │
   ├── 🔍 Check stock → Redis
   │
   └── 📤 Push job → BullMQ (Redis)
               │
               ▼
           📦 Redis (Queue)
               │
               ▼
           👷 Worker
               │
               ├── 🧠 Save order → MongoDB
               │
               └── ⚡ Push → Redis (purchases list)
## Layer 3 — Read Flow
👤 Admin / Frontend
   │
   ▼
🌐 NGINX
   │
   ▼
⚙️ API
   │
   ▼
📦 Redis (purchases list)
   │
   ▼
📊 Response (latest buyers)

## architecture
Client
 ↓
Load Balancer (NGINX)
 ↓
API Layer (multiple instances)
 ↓
Redis (Queue via BullMQ)
 ↓
Worker
 ↓
MongoDB

## 🚀 Load Testing & Stress Testing

To ensure the system can handle high traffic scenarios (e.g. flash sale spikes), this project includes support for stress testing using **Autocannon** and **k6**.

---

### ⚡ Autocannon (Quick Benchmark)

Autocannon is a fast HTTP benchmarking tool for quick performance checks.

#### Run test:

```bash
npx autocannon -c 100 -d 10 http://localhost:8080/api/buy-bull -> for BullMQ
npx autocannon -c 100 -d 10 http://localhost:8080/api/buy -> for Kafka
```

#### Parameters:

* `-c 100` → number of concurrent users
* `-d 10` → duration in seconds

#### Use cases:

* Quick API performance checks
* Throughput measurement (requests/sec)
* Detecting obvious bottlenecks

---

### 📊 k6 (Advanced Load Testing)

k6 allows more realistic and customizable load testing scenarios.

#### Example script (`k6.js`): look at test.js inside k6 folder

```js
import http from 'k6/http';

export const options = {
  vus: 100,          // number of virtual users
  duration: '10s',   // test duration
};
```
#### Run test (via Docker):
docker compose run k6 run /scripts/k6.js

#### Use cases:

* Simulating real user behavior
* Stress testing under high concurrency
* Testing scalability and system limits

---

### 🧠 What We Are Testing

This system includes:

* Load balancing (NGINX)
* Distributed API instances
* Queue-based processing (BullMQ / Redis or Kafka)
* Worker-based asynchronous processing
* MongoDB as the primary database

Stress testing helps validate:

* API stability under load
* Queue performance and job handling
* Worker processing throughput
* Database consistency under concurrency

---

### 🎯 Summary

| Tool       | Strength                        |
| ---------- | ------------------------------- |
| Autocannon | Fast, simple benchmarking       |
| k6         | Advanced, scriptable load tests |

Using both tools provides confidence that the system is scalable, resilient, and production-ready.


# SCRIPTS
## Docker down and up
docker compose down -v
docker compose up --build
## Check container yang aktif
docker ps
## Untuk melakukan Seed Data di Redis, masuk kedalam container
docker exec -it loadbalancer-backend1-1 sh && node seed.js
## liat log worker
docker-compose logs -f worker
docker compose logs -f -t worker
docker compose logs -f worker | grep Processing
## multi service monitoring
docker compose logs -f nginx backend1 backend2 worker
## connect to kafka
docker exec -it loadbalancer-kafka-1 bash
## kafka create topics
/opt/kafka/bin/kafka-topics.sh \
  --create \
  --topic orders \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1
## kafka cek topics
/opt/kafka/bin/kafka-topics.sh \
  --list \
  --bootstrap-server localhost:9092

# Dashboard
## monggodb
http://localhost:8081/db/shop/orders
## bull dashboard
http://localhost:8080/admin/queues
## kafka
http://localhost:8082

# test from browser
http://localhost:8080/api

# easy testing
for i in {1..10}; do curl "http://localhost:8080/api/buy?user=$i"; done

### Test Result for BullMQ
LoadBalancer npx autocannon -c 100 -d 10 http://localhost:8080/api/buy-bull
Running 10s test @ http://localhost:8080/api/buy-bull
100 connections


┌─────────┬──────┬───────┬───────┬───────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max    │
├─────────┼──────┼───────┼───────┼───────┼──────────┼──────────┼────────┤
│ Latency │ 3 ms │ 12 ms │ 60 ms │ 80 ms │ 16.98 ms │ 15.36 ms │ 163 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴──────────┴────────┘
┌───────────┬────────┬────────┬─────────┬────────┬─────────┬──────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%  │ Avg     │ Stdev    │ Min    │
├───────────┼────────┼────────┼─────────┼────────┼─────────┼──────────┼────────┤
│ Req/Sec   │ 2,259  │ 2,259  │ 5,859   │ 7,699  │ 5,720.5 │ 1,430.49 │ 2,258  │
├───────────┼────────┼────────┼─────────┼────────┼─────────┼──────────┼────────┤
│ Bytes/Sec │ 791 kB │ 791 kB │ 2.05 MB │ 2.7 MB │ 2 MB    │ 501 kB   │ 790 kB │
└───────────┴────────┴────────┴─────────┴────────┴─────────┴──────────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

57k requests in 10.01s, 20 MB read

### stress test with Kafka
LoadBalancer npx autocannon -c 100 -d 10 http://localhost:8080/api/buy
Running 10s test @ http://localhost:8080/api/buy
100 connections


┌─────────┬──────┬───────┬───────┬────────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%    │ Avg      │ Stdev    │ Max    │
├─────────┼──────┼───────┼───────┼────────┼──────────┼──────────┼────────┤
│ Latency │ 3 ms │ 33 ms │ 92 ms │ 101 ms │ 37.44 ms │ 24.38 ms │ 155 ms │
└─────────┴──────┴───────┴───────┴────────┴──────────┴──────────┴────────┘
┌───────────┬────────┬────────┬────────┬────────┬─────────┬────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg     │ Stdev  │ Min    │
├───────────┼────────┼────────┼────────┼────────┼─────────┼────────┼────────┤
│ Req/Sec   │ 1,644  │ 1,644  │ 2,795  │ 3,147  │ 2,629.7 │ 461.72 │ 1,644  │
├───────────┼────────┼────────┼────────┼────────┼─────────┼────────┼────────┤
│ Bytes/Sec │ 574 kB │ 574 kB │ 975 kB │ 1.1 MB │ 918 kB  │ 161 kB │ 574 kB │
└───────────┴────────┴────────┴────────┴────────┴─────────┴────────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

26k requests in 10.01s, 9.18 MB read