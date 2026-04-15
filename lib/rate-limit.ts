const requestMap = new Map<string, number[]>();

// Clean up stale entries every 5 minutes to prevent unbounded memory growth
setInterval(
  () => {
    const cutoff = Date.now() - 60_000;
    for (const [key, timestamps] of requestMap) {
      const fresh = timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) {
        requestMap.delete(key);
      } else {
        requestMap.set(key, fresh);
      }
    }
  },
  5 * 60 * 1000,
);

export function isRateLimited(key: string, maxRequests = 10, windowMs = 60_000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const requests = (requestMap.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (requests.length >= maxRequests) {
    requestMap.set(key, requests);
    return true;
  }

  requests.push(now);
  requestMap.set(key, requests);
  return false;
}
