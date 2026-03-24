export const keys = {
  stock: productId => `stock:${productId}`,
  userBought: userId => `user:${userId}:bought`,
  rateLimit: userId => `req:${userId}`,
  lock: userId => `lock:${userId}`,
};