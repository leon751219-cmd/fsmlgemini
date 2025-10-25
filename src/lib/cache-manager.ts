/**
 * 智能缓存管理器
 * 根据环境自动选择最适合的缓存策略
 */

// 检测当前运行环境
export const isServerless = () => {
  return process.env.VERCEL === '1' ||
         process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
         process.env.FUNCTION_TARGET !== undefined ||
         process.env.K_SERVICE !== undefined;
};

// 根据环境选择缓存实现
let cacheInstance: any = null;

const getCacheInstance = () => {
  if (cacheInstance) {
    return cacheInstance;
  }

  if (isServerless()) {
    // Serverless环境使用内存缓存
    const { memoryCache } = require('./memory-cache');
    cacheInstance = memoryCache;
    console.log('🌐 使用内存缓存 (Serverless环境)');
  } else {
    // 本地开发使用文件缓存
    const { localCache } = require('./local-cache');
    cacheInstance = localCache;
    console.log('💻 使用文件缓存 (本地环境)');
  }

  return cacheInstance;
};

// 统一的缓存接口
export const cache = {
  get: (key: string) => getCacheInstance().get(key),
  set: (key: string, data: any, ttlHours?: number) => getCacheInstance().set(key, data, ttlHours),
  delete: (key: string) => getCacheInstance().delete(key),
  generateKey: (data: any) => getCacheInstance().generateKey(data),
  cleanup: () => getCacheInstance().cleanup(),
  clear: () => getCacheInstance().clear(),
  getStats: () => getCacheInstance().getStats(),
  stopCleanup: () => getCacheInstance().stopCleanup()
};

// 导出环境检测函数
export { isServerless };