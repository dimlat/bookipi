import redis from "./src/lib/redis.js";

await redis.set('stock:product1', 100000);
// TTL
await redis.expire('stock:product1', 3600); // 1 jam

console.log('Stock seeded');
process.exit();