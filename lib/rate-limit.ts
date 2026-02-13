const hits = new Map<string, number[]>();

/**
 * Simple in-memory rate limiter.
 * @param key - unique key (e.g., `${userId}:${action}`)
 * @param maxHits - max allowed hits in the window
 * @param windowMs - time window in milliseconds
 * @returns true if rate limited (should block), false if ok
 */
export function isRateLimited(
  key: string,
  maxHits: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const timestamps = hits.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxHits) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);
  return false;
}
