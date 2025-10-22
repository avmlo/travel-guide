import { Request, Response, NextFunction } from "express";
import { RATE_LIMITS } from "@shared/const";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiting middleware for Express
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum number of requests per window
 */
export function rateLimitMiddleware(
  windowMs: number = RATE_LIMITS.WINDOW_MS,
  maxRequests: number = RATE_LIMITS.AI_REQUESTS_PER_WINDOW
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP address as identifier, fallback to a default
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetTime < now) {
      // First request or window expired, create new entry
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(entry.resetTime));

      return res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter,
      });
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(identifier, entry);

    // Set rate limit headers
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - entry.count));
    res.set('X-RateLimit-Reset', String(entry.resetTime));

    next();
  };
}

/**
 * Rate limiter for AI endpoints (stricter limits)
 */
export const aiRateLimiter = rateLimitMiddleware(
  RATE_LIMITS.WINDOW_MS,
  RATE_LIMITS.AI_REQUESTS_PER_WINDOW
);
