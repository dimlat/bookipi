import Redis from 'ioredis';

const redis = new Redis({ host: 'redis' });

await redis.set('stock:product1', 100000);
// TTL
await redis.expire('stock:product1', 3600); // 1 jam

console.log('Stock seeded');
process.exit();