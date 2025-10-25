/**
 * 本地文件缓存工具
 * 用于缓存命理报告，减少API调用，提升响应速度
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  createdAt: string;
  hits: number;
}

class LocalCache {
  private cacheDir: string;
  private maxEntries: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxEntries: number = 1000) {
    this.cacheDir = join(process.cwd(), 'cache');
    this.maxEntries = maxEntries;

    // 确保缓存目录存在
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
      console.log('📁 创建缓存目录:', this.cacheDir);
    }

    // 定期清理过期缓存
    this.startCleanup();
  }

  /**
   * 生成安全的缓存key
   */
  public generateKey(data: any): string {
    const keyString = JSON.stringify(data);
    return createHash('md5').update(keyString).digest('hex');
  }

  /**
   * 获取缓存文件路径
   */
  private getFilePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
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

    const filePath = this.getFilePath(key);

    try {
      writeFileSync(filePath, JSON.stringify(entry, null, 2));
      console.log(`💾 缓存已保存: ${key.substring(0, 8)}... (${JSON.stringify(data).length} bytes)`);

      // 检查缓存数量，如果超过限制则清理最旧的
      this.checkAndCleanOldest();

    } catch (error) {
      console.error('❌ 缓存写入失败:', error);
    }
  }

  /**
   * 从缓存获取数据
   */
  get(key: string): any | null {
    const filePath = this.getFilePath(key);

    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(fileContent);

      // 检查是否过期
      if (Date.now() - entry.timestamp > entry.ttl) {
        console.log(`⏰ 缓存已过期: ${key.substring(0, 8)}...`);
        this.delete(key);
        return null;
      }

      // 更新命中次数
      entry.hits += 1;
      writeFileSync(filePath, JSON.stringify(entry, null, 2));

      console.log(`🎯 缓存命中: ${key.substring(0, 8)}... (命中${entry.hits}次)`);
      return entry.data;

    } catch (error) {
      console.error('❌ 缓存读取失败:', error);
      // 如果文件损坏，删除它
      this.delete(key);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    const filePath = this.getFilePath(key);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
        console.log(`🗑️ 缓存已删除: ${key.substring(0, 8)}...`);
      } catch (error) {
        console.error('❌ 缓存删除失败:', error);
      }
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    let cleanedCount = 0;

    try {
      const files = readdirSync(this.cacheDir);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = join(this.cacheDir, file);
        const stats = statSync(filePath);

        try {
          const content = readFileSync(filePath, 'utf-8');
          const entry: CacheEntry = JSON.parse(content);

          if (Date.now() - entry.timestamp > entry.ttl) {
            unlinkSync(filePath);
            cleanedCount++;
          }
        } catch (error) {
          // 文件损坏，直接删除
          unlinkSync(filePath);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 清理了 ${cleanedCount} 个过期缓存文件`);
      }

    } catch (error) {
      console.error('❌ 缓存清理失败:', error);
    }

    return cleanedCount;
  }

  /**
   * 检查并清理最旧的缓存
   */
  private checkAndCleanOldest(): void {
    try {
      const files = readdirSync(this.cacheDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      if (jsonFiles.length <= this.maxEntries) {
        return;
      }

      // 获取所有文件的信息
      const fileInfos = jsonFiles.map(file => {
        const filePath = join(this.cacheDir, file);
        const stats = statSync(filePath);
        return {
          file,
          filePath,
          mtime: stats.mtime.getTime()
        };
      });

      // 按修改时间排序，删除最旧的
      fileInfos.sort((a, b) => a.mtime - b.mtime);
      const toDelete = fileInfos.slice(0, fileInfos.length - this.maxEntries);

      let deletedCount = 0;
      for (const info of toDelete) {
        try {
          unlinkSync(info.filePath);
          deletedCount++;
        } catch (error) {
          console.error(`❌ 删除缓存文件失败: ${info.file}`, error);
        }
      }

      if (deletedCount > 0) {
        console.log(`🗑️ 删除了 ${deletedCount} 个最旧的缓存文件`);
      }

    } catch (error) {
      console.error('❌ 检查缓存数量失败:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    totalFiles: number;
    totalSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
  } {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      oldestFile: null as Date | null,
      newestFile: null as Date | null
    };

    try {
      const files = readdirSync(this.cacheDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      stats.totalFiles = jsonFiles.length;

      const mtimes: Date[] = [];

      for (const file of jsonFiles) {
        const filePath = join(this.cacheDir, file);
        const fileStats = statSync(filePath);

        stats.totalSize += fileStats.size;
        mtimes.push(fileStats.mtime);
      }

      if (mtimes.length > 0) {
        stats.oldestFile = new Date(Math.min(...mtimes.map(d => d.getTime())));
        stats.newestFile = new Date(Math.max(...mtimes.map(d => d.getTime())));
      }

    } catch (error) {
      console.error('❌ 获取缓存统计失败:', error);
    }

    return stats;
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    // 每小时清理一次过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
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
    let deletedCount = 0;

    try {
      const files = readdirSync(this.cacheDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.cacheDir, file);
          try {
            unlinkSync(filePath);
            deletedCount++;
          } catch (error) {
            console.error(`❌ 删除缓存文件失败: ${file}`, error);
          }
        }
      }

      console.log(`🗑️ 清空了所有缓存，删除了 ${deletedCount} 个文件`);

    } catch (error) {
      console.error('❌ 清空缓存失败:', error);
    }

    return deletedCount;
  }
}

// 创建全局缓存实例
export const localCache = new LocalCache(1000); // 最多缓存1000个条目

// 导出缓存管理函数
export const cacheManager = {
  getStats: () => localCache.getStats(),
  cleanup: () => localCache.cleanup(),
  clear: () => localCache.clear(),
  stopCleanup: () => localCache.stopCleanup()
};