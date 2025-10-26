/**
 * Vercel兼容的内存缓存工具
 * 用于Serverless环境的命理报告缓存
 */

import { createHash } from 'crypto';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  createdAt: string;
  hits: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry>;
  private maxEntries: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxEntries: number = 500) {
    this.cache = new Map();
    this.maxEntries = maxEntries;

    // 在Serverless环境中使用较短的清理间隔
    this.startCleanup();
    console.log('🧠 初始化内存缓存系统 (Vercel兼容)');
  }

  /**
   * 生成安全的缓存key
   */
  public generateKey(data: any): string {
    const keyString = JSON.stringify(data);
    return createHash('md5').update(keyString).digest('hex');
  }

  /**
   * 存储数据到缓存
   */
  set(key: string, data: any, ttlHours: number = 24): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttlHours * 60 * 60 * 1000,
      createdAt: new Date().toISOString(),
      hits: 0
    };

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxEntries) {
      this.deleteOldest();
    }

    this.cache.set(key, entry);
    console.log(`💾 内存缓存已保存: ${key.substring(0, 8)}... (${JSON.stringify(data).length} bytes)`);
  }

  /**
   * 从缓存获取数据
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      console.log(`⏰ 缓存已过期: ${key.substring(0, 8)}...`);
      this.cache.delete(key);
      return null;
    }

    // 更新命中次数
    entry.hits += 1;
    this.cache.set(key, entry);

    console.log(`🎯 缓存命中: ${key.substring(0, 8)}... (命中${entry.hits}次)`);
    return entry.data;
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ 缓存已删除: ${key.substring(0, 8)}...`);
    }
  }

  /**
   * 删除最旧的缓存条目
   */
  private deleteOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ 删除最旧缓存: ${oldestKey.substring(0, 8)}...`);
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    let cleanedCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 清理了 ${cleanedCount} 个过期缓存条目`);
    }

    return cleanedCount;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    totalEntries: number;
    totalMemoryKB: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    hitRate: number;
    totalHits: number;
  } {
    const stats = {
      totalEntries: this.cache.size,
      totalMemoryKB: 0,
      oldestEntry: null as Date | null,
      newestEntry: null as Date | null,
      hitRate: 0,
      totalHits: 0
    };

    if (this.cache.size === 0) {
      return stats;
    }

    let totalHits = 0;
    let oldestTime = Date.now();
    let newestTime = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalHits += entry.hits;
      oldestTime = Math.min(oldestTime, entry.timestamp);
      newestTime = Math.max(newestTime, entry.timestamp);

      // 估算内存使用
      stats.totalMemoryKB += JSON.stringify(entry).length;
    }

    stats.totalHits = totalHits;
    stats.hitRate = totalHits / Math.max(this.cache.size, 1);
    stats.oldestEntry = new Date(oldestTime);
    stats.newestEntry = new Date(newestTime);
    stats.totalMemoryKB = Math.round(stats.totalMemoryKB / 1024);

    return stats;
  }

  /**
   * 启动定期清理 (Serverless环境使用较短间隔)
   */
  private startCleanup(): void {
    // 在Serverless环境中，每15分钟清理一次
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 15 * 60 * 1000);
  }

  /**
   * 停止定期清理
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): number {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ 清空了所有缓存，删除了 ${count} 个条目`);
    return count;
  }

  /**
   * 获取缓存大小 (字节)
   */
  getMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += JSON.stringify(entry).length;
    }
    return totalSize;
  }

  /**
   * 检查缓存是否接近容量限制
   */
  isNearCapacity(): boolean {
    return this.cache.size >= this.maxEntries * 0.9;
  }
}

// 创建全局内存缓存实例
export const memoryCache = new MemoryCache(500); // 最多缓存500个条目

// 导出缓存管理函数
export const cacheManager = {
  getStats: () => memoryCache.getStats(),
  cleanup: () => memoryCache.cleanup(),
  clear: () => memoryCache.clear(),
  stopCleanup: () => memoryCache.stopCleanup(),
  isNearCapacity: () => memoryCache.isNearCapacity(),
  getMemoryUsage: () => memoryCache.getMemoryUsage()
};

// 兼容性导出，保持与原有local-cache.ts相同的接口
export { memoryCache as localCache };