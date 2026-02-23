// Rate Limiter for API protection
// Uses in-memory storage for simplicity, can be replaced with Redis for production

interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param limit - Max requests allowed
   * @param window - Time window in milliseconds
   * @returns Object with allowed status and retry info
   */
  check(identifier: string, limit: number = 100, window: number = 60 * 1000) {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + window,
        lastRequest: now,
      }
      this.store.set(identifier, newEntry)
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: newEntry.resetTime,
      }
    }

    // Update existing entry
    entry.count += 1
    entry.lastRequest = now
    this.store.set(identifier, entry)

    if (entry.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      }
    }

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string) {
    this.store.delete(identifier)
  }

  /**
   * Get current status for identifier
   */
  getStatus(identifier: string) {
    const entry = this.store.get(identifier)
    if (!entry) {
      return {
        count: 0,
        remaining: 100, // Default limit
        resetTime: Date.now() + 60 * 1000,
      }
    }

    return {
      count: entry.count,
      remaining: Math.max(0, 100 - entry.count),
      resetTime: entry.resetTime,
    }
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clear() {
    this.store.clear()
  }

  /**
   * Get number of active entries
   */
  size() {
    return this.store.size
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    limit: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },
  // API endpoints - normal limits
  API: {
    limit: 100,
    window: 60 * 1000, // 1 minute
  },
  // Read operations - more lenient
  READ: {
    limit: 200,
    window: 60 * 1000, // 1 minute
  },
  // Write operations - stricter
  WRITE: {
    limit: 50,
    window: 60 * 1000, // 1 minute
  },
  // File uploads - very strict
  UPLOAD: {
    limit: 10,
    window: 60 * 1000, // 1 minute
  },
  // Search operations - moderate
  SEARCH: {
    limit: 30,
    window: 60 * 1000, // 1 minute
  },
} as const

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP
  const headers = request.headers
  
  // Try standard headers
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP
  }

  // Fallback to a default IP (shouldn't happen in production)
  return 'unknown'
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Check rate limit and return response if exceeded
 */
export async function checkRateLimit(
  request: Request,
  limitConfig: { limit: number; window: number },
  identifier?: string
) {
  const ip = identifier || getClientIP(request)
  const result = rateLimiter.check(ip, limitConfig.limit, limitConfig.window)

  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter!.toString(),
            'X-RateLimit-Limit': limitConfig.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime!).toUTCString(),
          },
        }
      ),
    }
  }

  return {
    allowed: true,
    headers: {
      'X-RateLimit-Limit': limitConfig.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toUTCString(),
    },
  }
}
