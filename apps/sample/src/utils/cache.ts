export const CacheKey = {
  user: (userId: number) => `user:${userId}`,
};

export const CacheTTL = {
  user: 60 * 5,
};
