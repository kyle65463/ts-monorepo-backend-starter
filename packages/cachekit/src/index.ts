import { Redis, RedisOptions } from "ioredis";
import { ZodSchema } from "zod";

/**
 * Reviver function for JSON.parse to convert string to Date
 */
const jsonReviver = (key: string, value: unknown) => {
  if (typeof value === "string") {
    const dateRegex =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/;
    const match = dateRegex.exec(value);
    if (match) {
      return new Date(
        Date.UTC(
          parseInt(match[1], 10),
          parseInt(match[2], 10) - 1,
          parseInt(match[3], 10),
          parseInt(match[4], 10),
          parseInt(match[5], 10),
          parseInt(match[6], 10),
          parseInt(match[7], 10),
        ),
      );
    }
  }
  return value;
};

interface CreateCacheClientProps {
  redisOptions: RedisOptions;
}

export function createCacheClient({ redisOptions }: CreateCacheClientProps) {
  const redis = new Redis(redisOptions);

  async function flushAll() {
    await redis.flushall();
  }

  /**
   * Get data from cache.
   * @param key - The cache key.
   */
  async function get(key: string) {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data, jsonReviver);
    } catch (err) {
      return null;
    }
  }

  /**
   * Set data to cache.
   * @param key - The cache key.
   * @param data - The data to be cached.
   * @param ttl - Time to live in seconds.
   */
  async function set<T>(key: string, data: T, ttl?: number) {
    if (ttl) {
      await redis.set(key, JSON.stringify(data), "EX", ttl);
    } else {
      await redis.set(key, JSON.stringify(data));
    }
  }

  /**
   * Get data from cache, if not found, get data from other source and set the data to cache.
   * @param key - The cache key.
   * @param ttl - Time to live in seconds.
   * @param schema - The zod schema of the data.
   * @param willSetIfNotFound - If true, set the data to cache if not found. Default is true.
   * @params getData - The function to get data from other source.
   */
  async function getAndSet<T>({
    key,
    ttl,
    schema,
    willSetIfNotFound = true,
    getData,
  }: {
    key: string;
    ttl?: number;
    schema?: ZodSchema<T>;
    willSetIfNotFound?: boolean;
    getData: () => Promise<T> | T;
  }): Promise<T> {
    // Try to get data from cache
    try {
      const rawCachedValue = await redis.get(key);
      if (rawCachedValue) {
        // Cache hit
        if (!schema) return JSON.parse(rawCachedValue);
        const parsed = schema.safeParse(
          JSON.parse(rawCachedValue, jsonReviver),
        );
        if (parsed.success) {
          const cachedValue = parsed.data;
          return cachedValue;
        }
      }
    } catch (err) {
      // TODO: check if redis is connected
    }

    // Cache miss, get data from other source and set the data to cache
    const data = await getData();
    if (willSetIfNotFound) {
      await set(key, data, ttl);
    }

    return data;
  }

  return { redis, flushAll, set, get, getAndSet };
}

export type CacheClient = ReturnType<typeof createCacheClient>;
