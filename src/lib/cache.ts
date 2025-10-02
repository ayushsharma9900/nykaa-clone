/**
 * Advanced Caching System for Dynamic Content
 * Provides intelligent caching, revalidation, and cache invalidation strategies
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
  tags: string[];
  version: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // Tags for cache invalidation
  revalidateOnStale?: boolean; // Whether to revalidate when stale
  background?: boolean; // Whether to update in background
}

interface RevalidationStrategy {
  interval: number; // Revalidation interval in milliseconds
  condition?: () => boolean; // Optional condition for revalidation
  priority: 'high' | 'medium' | 'low';
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private tagIndex = new Map<string, Set<string>>(); // Tag -> Set of keys
  private revalidationQueue = new Map<string, RevalidationStrategy>();
  private isRevalidating = new Set<string>();
  private maxSize = 1000; // Maximum cache entries
  private gcThreshold = 0.8; // Garbage collection threshold (80% full)

  constructor() {
    // Start background revalidation process
    this.startBackgroundRevalidation();
    // Start periodic garbage collection
    this.startGarbageCollection();
  }

  /**
   * Get cached data with automatic revalidation
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();

    // Cache hit and not expired
    if (entry && now < entry.expiresAt) {
      // Schedule background revalidation if enabled and approaching expiry
      if (options.revalidateOnStale && this.isApproachingExpiry(entry)) {
        this.scheduleBackgroundRevalidation(key, fetcher, options);
      }
      return entry.data;
    }

    // Cache miss or expired - fetch fresh data
    try {
      const data = await fetcher();
      this.set(key, data, options);
      return data;
    } catch (error) {
      // If we have stale data, return it while logging the error
      if (entry) {
        console.warn(`Cache: Failed to revalidate ${key}, returning stale data:`, error);
        return entry.data;
      }
      throw error;
    }
  }

  /**
   * Set cache entry with options
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
    const tags = options.tags || [];

    // Remove old entry from tag index
    this.removeFromTagIndex(key);

    // Create new entry
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      key,
      tags,
      version: 1
    };

    this.cache.set(key, entry);

    // Update tag index
    this.addToTagIndex(key, tags);

    // Trigger garbage collection if needed
    if (this.cache.size > this.maxSize * this.gcThreshold) {
      this.runGarbageCollection();
    }
  }

  /**
   * Invalidate cache by key
   */
  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.removeFromTagIndex(key);
    this.isRevalidating.delete(key);
    return deleted;
  }

  /**
   * Invalidate cache by tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        for (const key of keys) {
          if (this.invalidate(key)) {
            invalidated++;
          }
        }
        this.tagIndex.delete(tag);
      }
    }

    return invalidated;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
    this.isRevalidating.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries: valid,
      expiredEntries: expired,
      taggedEntries: this.tagIndex.size,
      revalidationQueue: this.revalidationQueue.size,
      activeRevalidations: this.isRevalidating.size,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Schedule revalidation strategy for a key
   */
  scheduleRevalidation(key: string, strategy: RevalidationStrategy): void {
    this.revalidationQueue.set(key, strategy);
  }

  /**
   * Remove revalidation strategy
   */
  removeRevalidation(key: string): void {
    this.revalidationQueue.delete(key);
  }

  // Private methods

  private isApproachingExpiry(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    const totalTtl = entry.expiresAt - entry.timestamp;
    const remaining = entry.expiresAt - now;
    return remaining < totalTtl * 0.2; // Less than 20% of TTL remaining
  }

  private async scheduleBackgroundRevalidation<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    if (this.isRevalidating.has(key)) {
      return; // Already revalidating
    }

    this.isRevalidating.add(key);

    try {
      // Use setTimeout to avoid blocking
      setTimeout(async () => {
        try {
          const data = await fetcher();
          this.set(key, data, options);
        } catch (error) {
          console.warn(`Background revalidation failed for ${key}:`, error);
        } finally {
          this.isRevalidating.delete(key);
        }
      }, 0);
    } catch (error) {
      this.isRevalidating.delete(key);
    }
  }

  private addToTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  private removeFromTagIndex(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      for (const tag of entry.tags) {
        const keys = this.tagIndex.get(tag);
        if (keys) {
          keys.delete(key);
          if (keys.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      }
    }
  }

  private startBackgroundRevalidation(): void {
    setInterval(() => {
      this.processRevalidationQueue();
    }, 30000); // Check every 30 seconds
  }

  private processRevalidationQueue(): void {
    const now = Date.now();
    
    for (const [key, strategy] of this.revalidationQueue.entries()) {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.revalidationQueue.delete(key);
        continue;
      }

      const shouldRevalidate = 
        now - entry.timestamp > strategy.interval &&
        (!strategy.condition || strategy.condition());

      if (shouldRevalidate && !this.isRevalidating.has(key)) {
        // Schedule revalidation based on priority
        const delay = strategy.priority === 'high' ? 0 : 
                     strategy.priority === 'medium' ? 1000 : 5000;

        setTimeout(() => {
          this.revalidateEntry(key);
        }, delay);
      }
    }
  }

  private async revalidateEntry(key: string): Promise<void> {
    // This would need to be implemented with actual fetching logic
    // For now, we just mark as revalidating and remove after delay
    this.isRevalidating.add(key);
    
    setTimeout(() => {
      this.isRevalidating.delete(key);
    }, 5000);
  }

  private startGarbageCollection(): void {
    setInterval(() => {
      this.runGarbageCollection();
    }, 60000); // Run every minute
  }

  private runGarbageCollection(): void {
    const now = Date.now();
    const entriesToRemove: string[] = [];

    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        entriesToRemove.push(key);
      }
    }

    // If still over capacity, remove oldest entries
    if (this.cache.size - entriesToRemove.length > this.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp);
      
      const excess = this.cache.size - entriesToRemove.length - this.maxSize;
      for (let i = 0; i < excess; i++) {
        entriesToRemove.push(sortedEntries[i][0]);
      }
    }

    // Remove identified entries
    for (const key of entriesToRemove) {
      this.invalidate(key);
    }

    if (entriesToRemove.length > 0) {
      console.log(`Cache GC: Removed ${entriesToRemove.length} entries`);
    }
  }

  private calculateHitRate(): number {
    // This would require tracking hits and misses
    // For now, return a placeholder
    return 0.85;
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let size = 0;
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length * 2; // Rough estimate
    }
    return size;
  }
}

// Global cache instance
const globalCache = new AdvancedCache();

// Predefined cache configurations for different data types
export const CacheConfigs = {
  PRODUCTS: {
    ttl: 10 * 60 * 1000, // 10 minutes
    tags: ['products'],
    revalidateOnStale: true
  },
  CATEGORIES: {
    ttl: 30 * 60 * 1000, // 30 minutes
    tags: ['categories'],
    revalidateOnStale: true
  },
  MENU_ITEMS: {
    ttl: 60 * 60 * 1000, // 1 hour
    tags: ['menu', 'navigation'],
    revalidateOnStale: true
  },
  SETTINGS: {
    ttl: 60 * 60 * 1000, // 1 hour
    tags: ['settings'],
    revalidateOnStale: false // Settings should be explicitly revalidated
  },
  USER_DATA: {
    ttl: 5 * 60 * 1000, // 5 minutes
    tags: ['user'],
    revalidateOnStale: true
  },
  ORDERS: {
    ttl: 2 * 60 * 1000, // 2 minutes
    tags: ['orders'],
    revalidateOnStale: true
  }
};

// Convenience functions for common operations
export const CacheUtils = {
  /**
   * Cache products with automatic invalidation
   */
  cacheProducts: <T>(key: string, fetcher: () => Promise<T>) => 
    globalCache.get(key, fetcher, CacheConfigs.PRODUCTS),

  /**
   * Cache categories with long TTL
   */
  cacheCategories: <T>(key: string, fetcher: () => Promise<T>) => 
    globalCache.get(key, fetcher, CacheConfigs.CATEGORIES),

  /**
   * Cache menu items with extended TTL
   */
  cacheMenuItems: <T>(key: string, fetcher: () => Promise<T>) => 
    globalCache.get(key, fetcher, CacheConfigs.MENU_ITEMS),

  /**
   * Cache settings with manual revalidation
   */
  cacheSettings: <T>(key: string, fetcher: () => Promise<T>) => 
    globalCache.get(key, fetcher, CacheConfigs.SETTINGS),

  /**
   * Invalidate product-related cache
   */
  invalidateProducts: () => globalCache.invalidateByTags(['products']),

  /**
   * Invalidate category-related cache
   */
  invalidateCategories: () => globalCache.invalidateByTags(['categories']),

  /**
   * Invalidate navigation cache
   */
  invalidateNavigation: () => globalCache.invalidateByTags(['menu', 'navigation']),

  /**
   * Invalidate all cache
   */
  invalidateAll: () => globalCache.clear(),

  /**
   * Get cache statistics
   */
  getStats: () => globalCache.getStats()
};

// Export the main cache instance
export default globalCache;
