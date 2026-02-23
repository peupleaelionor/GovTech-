/**
 * Simple In-Memory Cache Manager
 * For production, consider using Redis or a dedicated caching solution
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
  createdAt: number
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    this.cache.set(key, {
      data: value,
      expiresAt,
      createdAt: now,
    })
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear all cache entries matching a pattern
   */
  clearPattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let deleted = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  /**
   * Get or set a value (memoization pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Compute value
    const value = await factory()

    // Store in cache
    this.set(key, value, ttl)

    return value
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let deleted = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key)
        deleted++
      }
    }

    if (deleted > 0) {
      console.log(`Cache cleanup: removed ${deleted} expired entries`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    for (const entry of this.cache.values()) {
      if (entry.expiresAt < now) {
        expired++
      } else {
        active++
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      size: JSON.stringify([...this.cache.values()]).length,
    }
  }
}

// Global cache instance
export const cache = new CacheManager()

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  dashboardStats: (ministryId?: string) => 
    `dashboard:stats${ministryId ? `:${ministryId}` : ''}`,
  projects: (filters: Record<string, any>) => 
    `projects:${JSON.stringify(filters)}`,
  analytics: (type: string, params: Record<string, any>) =>
    `analytics:${type}:${JSON.stringify(params)}`,
  settings: () => 'settings:all',
  ministry: (ministryId: string) => `ministry:${ministryId}`,
} as const
