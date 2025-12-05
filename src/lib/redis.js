// Redis Client Configuration
import Redis from 'ioredis';

let redis = null;

export function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis Connected');
    });
  }

  return redis;
}

// Cache helper functions
export async function cacheGet(key) {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(key, value, expirySeconds = 3600) {
  try {
    const client = getRedisClient();
    await client.setex(key, expirySeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function cacheDelete(key) {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

export async function cacheInvalidatePattern(pattern) {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Cache invalidate error:', error);
    return false;
  }
}

// Middleware for API caching
export function withCache(handler, options = {}) {
  const { keyPrefix = 'api', ttl = 300 } = options;

  return async (req, res) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req, res);
    }

    const cacheKey = `${keyPrefix}:${req.url}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Intercept response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cacheSet(cacheKey, data, ttl);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    return handler(req, res);
  };
}
