import type { Context, Next } from 'hono';

/**
 * Rate Limiting Middleware
 * Basic rate limiting to prevent abuse
 * Following security principles from copilot-instructions.md
 *
 * Note: This is an in-memory implementation suitable for single-server deployments.
 * For production with multiple servers, use Redis-based rate limiting.
 */

/**
 * Rate limit store entry
 */
interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

/**
 * Rate limiter class
 */
class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {
    // Cleanup expired entries every 5 minutes
    this.startCleanup();
  }

  /**
   * Get max requests limit
   */
  getMaxRequests(): number {
    return this.maxRequests;
  }

  /**
   * Check if request should be rate limited
   * @param key - Identifier (IP address or user ID)
   * @returns true if rate limit exceeded
   */
  isRateLimited(key: string): boolean {
    const now = new Date();
    const entry = this.store.get(key);

    if (!entry) {
      // First request from this key
      this.store.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + this.windowMs),
      });
      return false;
    }

    // Check if window has expired
    if (now >= entry.resetAt) {
      // Reset the window
      entry.count = 1;
      entry.resetAt = new Date(now.getTime() + this.windowMs);
      return false;
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    return entry.count > this.maxRequests;
  }

  /**
   * Get remaining requests for key
   */
  getRemaining(key: string): number {
    const entry = this.store.get(key);
    if (!entry) {
      return this.maxRequests;
    }

    const now = new Date();
    if (now >= entry.resetAt) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until reset (in milliseconds)
   */
  getResetTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) {
      return 0;
    }

    const now = new Date();
    if (now >= entry.resetAt) {
      return 0;
    }

    return entry.resetAt.getTime() - now.getTime();
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      for (const [key, entry] of this.store.entries()) {
        if (now >= entry.resetAt) {
          this.store.delete(key);
        }
      }
    }, 300000); // 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }

  /**
   * Get statistics
   */
  getStats(): { totalKeys: number; averageUsage: number } {
    if (this.store.size === 0) {
      return { totalKeys: 0, averageUsage: 0 };
    }

    const now = new Date();
    let totalUsage = 0;
    let activeKeys = 0;

    for (const entry of this.store.values()) {
      if (now < entry.resetAt) {
        totalUsage += entry.count;
        activeKeys++;
      }
    }

    return {
      totalKeys: this.store.size,
      averageUsage: activeKeys > 0 ? totalUsage / activeKeys : 0,
    };
  }
}

/**
 * Global rate limiters for different endpoints
 */

// General API rate limiter: 100 requests per minute
export const apiRateLimiter = new RateLimiter(100, 60000);

// Auth endpoints: 10 requests per minute (stricter)
export const authRateLimiter = new RateLimiter(10, 60000);

// Write operations: 30 requests per minute
export const writeRateLimiter = new RateLimiter(30, 60000);

// Read operations: 200 requests per minute
export const readRateLimiter = new RateLimiter(200, 60000);

/**
 * Get client identifier for rate limiting
 * Uses user ID if authenticated, otherwise IP address
 */
function getClientIdentifier(c: Context): string {
  // Use user ID if authenticated
  const userId = c.get('userId');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwardedFor = c.req.header('X-Forwarded-For');
  const realIp = c.req.header('X-Real-IP');

  // Try different headers (for reverse proxies)
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    return `ip:${firstIp?.trim() || 'unknown'}`;
  }

  if (realIp) {
    return `ip:${realIp}`;
  }

  // Default fallback
  return 'ip:unknown';
}

/**
 * Rate limit middleware factory
 * @param limiter - Rate limiter instance to use
 */
export function rateLimitMiddleware(limiter: RateLimiter = apiRateLimiter) {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    const clientId = getClientIdentifier(c);

    // Check rate limit
    if (limiter.isRateLimited(clientId)) {
      const remaining = limiter.getRemaining(clientId);
      const resetTime = limiter.getResetTime(clientId);
      const resetSeconds = Math.ceil(resetTime / 1000);

      // Set rate limit headers
      c.header('X-RateLimit-Limit', limiter.getMaxRequests().toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', new Date(Date.now() + resetTime).toISOString());
      c.header('Retry-After', resetSeconds.toString());

      return c.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
            retryAfter: resetSeconds,
          },
        },
        429
      );
    }

    // Set rate limit headers
    const remaining = limiter.getRemaining(clientId);
    c.header('X-RateLimit-Limit', limiter.getMaxRequests().toString());
    c.header('X-RateLimit-Remaining', remaining.toString());

    await next();
  };
}

/**
 * Auth rate limit middleware
 * Stricter limits for authentication endpoints
 */
export const authRateLimit = rateLimitMiddleware(authRateLimiter);

/**
 * Write rate limit middleware
 * For POST, PUT, PATCH, DELETE operations
 */
export const writeRateLimit = rateLimitMiddleware(writeRateLimiter);

/**
 * Read rate limit middleware
 * For GET operations
 */
export const readRateLimit = rateLimitMiddleware(readRateLimiter);

/**
 * Get rate limiter statistics
 * Useful for monitoring
 */
export function getRateLimitStats() {
  return {
    api: apiRateLimiter.getStats(),
    auth: authRateLimiter.getStats(),
    write: writeRateLimiter.getStats(),
    read: readRateLimiter.getStats(),
  };
}

/**
 * Cleanup all rate limiters on shutdown
 */
export function shutdownRateLimiters() {
  apiRateLimiter.shutdown();
  authRateLimiter.shutdown();
  writeRateLimiter.shutdown();
  readRateLimiter.shutdown();
}
