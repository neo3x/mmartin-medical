import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

export async function setCache(
  key: string,
  value: any,
  expirationSeconds?: number
) {
  const serialized = JSON.stringify(value);

  if (expirationSeconds) {
    await redis.setex(key, expirationSeconds, serialized);
  } else {
    await redis.set(key, serialized);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export async function deleteCache(key: string) {
  await redis.del(key);
}

export async function clearCachePattern(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export function generateCacheKey(
  type: string,
  identifier: string,
  ...params: string[]
): string {
  return [type, identifier, ...params].filter(Boolean).join(':');
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  expirationSeconds: number = 3600
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  const result = await fetcher();
  await setCache(key, result, expirationSeconds);

  return result;
}

export async function incrementCounter(
  key: string,
  expirationSeconds?: number
): Promise<number> {
  const count = await redis.incr(key);

  if (expirationSeconds && count === 1) {
    await redis.expire(key, expirationSeconds);
  }

  return count;
}

export async function rateLimitCheck(
  userId: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = generateCacheKey('ratelimit', userId, action);
  const count = await incrementCounter(key, windowSeconds);

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
  };
}

export default redis;
