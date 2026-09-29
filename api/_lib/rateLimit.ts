import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitRecord {
  timestamps: number[];
  blockedUntil?: number;
}

// In-memory sliding window cache
const ipStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  maxRequests: number; // Maximum allowed requests in window
  windowMs: number;    // Window duration in milliseconds
  cooldownMs?: number; // Progressive cooldown if exceeded
}

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Applies sliding-window rate limiting to API endpoints.
 * Returns true if allowed, false if rejected (and sends HTTP 429 response automatically).
 */
export function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  key: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60 * 1000, cooldownMs: 15 * 1000 }
): boolean {
  const now = Date.now();
  const record = ipStore.get(key) || { timestamps: [] };

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
      retryAfter,
    });
    return false;
  }

  // Filter timestamps within window
  const windowStart = now - options.windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.maxRequests) {
    const cooldown = options.cooldownMs || 15 * 1000;
    record.blockedUntil = now + cooldown;
    ipStore.set(key, record);

    const retryAfter = Math.ceil(cooldown / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
      retryAfter,
    });
    return false;
  }

  // Record this request
  record.timestamps.push(now);
  ipStore.set(key, record);

  res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (options.maxRequests - record.timestamps.length).toString());
  return true;
}
