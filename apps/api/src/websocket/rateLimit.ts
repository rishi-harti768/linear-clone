/**
 * Rate limiting for WebSocket messages
 * Prevents abuse by limiting messages per client
 */

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

/**
 * Simple in-memory rate limiter
 * For production, consider Redis-based rate limiting
 */
export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxMessages: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxMessages = 100, windowMs = 60000) {
    // Default: 100 messages per minute
    this.maxMessages = maxMessages;
    this.windowMs = windowMs;

    // Cleanup expired entries every 5 minutes
    this.startCleanup();
  }

  /**
   * Check if a client has exceeded the rate limit
   * @param clientId - The client identifier (user ID or connection ID)
   * @returns true if rate limit exceeded, false otherwise
   */
  isRateLimited(clientId: string): boolean {
    const now = new Date();
    const entry = this.limits.get(clientId);

    if (!entry) {
      // First message from this client
      this.limits.set(clientId, {
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
    if (entry.count > this.maxMessages) {
      return true;
    }

    return false;
  }

  /**
   * Get remaining messages for a client
   */
  getRemaining(clientId: string): number {
    const entry = this.limits.get(clientId);
    if (!entry) {
      return this.maxMessages;
    }

    const now = new Date();
    if (now >= entry.resetAt) {
      return this.maxMessages;
    }

    return Math.max(0, this.maxMessages - entry.count);
  }

  /**
   * Get time until reset (in milliseconds)
   */
  getResetTime(clientId: string): number {
    const entry = this.limits.get(clientId);
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
   * Reset rate limit for a client (useful for testing or admin override)
   */
  reset(clientId: string): void {
    this.limits.delete(clientId);
  }

  /**
   * Start cleanup interval to remove expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      for (const [clientId, entry] of this.limits.entries()) {
        if (now >= entry.resetAt) {
          this.limits.delete(clientId);
        }
      }
    }, 300000); // 5 minutes
  }

  /**
   * Stop cleanup interval (call on shutdown)
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
  }

  /**
   * Get statistics
   */
  getStats(): { totalClients: number; averageUsage: number } {
    if (this.limits.size === 0) {
      return { totalClients: 0, averageUsage: 0 };
    }

    const now = new Date();
    let totalUsage = 0;
    let activeClients = 0;

    for (const entry of this.limits.values()) {
      if (now < entry.resetAt) {
        totalUsage += entry.count;
        activeClients++;
      }
    }

    return {
      totalClients: this.limits.size,
      averageUsage: activeClients > 0 ? totalUsage / activeClients : 0,
    };
  }
}

/**
 * Global rate limiter instance
 * 100 messages per minute per client
 */
export const wsRateLimiter = new RateLimiter(100, 60000);

/**
 * Stricter rate limiter for authentication attempts
 * 10 attempts per minute per IP
 */
export const authRateLimiter = new RateLimiter(10, 60000);
