'use server';

/**
 * 带缓存功能的命理报告生成函数
 * Vercel Serverless环境兼容
 */

import { generateFortuneReading, GenerateFortuneReadingInput, GenerateFortuneReadingOutput } from './generate-fortune-reading';
import { cache } from '@/lib/cache-manager';

/**
 * 生成带缓存的命理报告
 * 首先检查缓存，如果命中则返回缓存结果，否则调用AI生成
 */
export async function generateFortuneReadingWithCache(input: GenerateFortuneReadingInput): Promise<GenerateFortuneReadingOutput> {
  try {
    // 生成缓存key
    const cacheKey = cache.generateKey(input);

    console.log(`🔍 开始查询缓存: ${cacheKey.substring(0, 8)}...`);

    // 尝试从缓存获取
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log('✅ 缓存命中，直接返回结果');
      return cachedResult;
    }

    console.log('❌ 缓存未命中，开始AI生成...');

    // 缓存未命中，调用AI生成
    const startTime = Date.now();
    const result = await generateFortuneReading(input);
    const generationTime = Date.now() - startTime;

    console.log(`🤖 AI生成完成，耗时: ${generationTime}ms`);

    // 将结果存储到缓存（24小时TTL）
    cache.set(cacheKey, result, 24);

    console.log('💾 结果已缓存，返回新生成报告');
    return result;

  } catch (error) {
    console.error('❌ 生成命理报告失败:', error);

    // 重新抛出错误，让上层处理
    throw new Error(`生成命理报告时发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 预热缓存 - 为常用输入提前生成报告
 */
export async function warmupCache(inputs: GenerateFortuneReadingInput[]): Promise<void> {
  console.log(`🔥 开始预热缓存，共${inputs.length}个输入...`);

  for (const input of inputs) {
    try {
      const cacheKey = cache.generateKey(input);
      const cachedResult = cache.get(cacheKey);

      if (!cachedResult) {
        console.log(`🔥 预热缓存: ${JSON.stringify(input)}`);
        await generateFortuneReadingWithCache(input);
      }
    } catch (error) {
      console.error(`❌ 预热缓存失败:`, error);
    }
  }

  console.log('✅ 缓存预热完成');
}

/**
 * 清理特定输入的缓存
 */
export function clearCacheForInput(input: GenerateFortuneReadingInput): void {
  const cacheKey = cache.generateKey(input);
  cache.delete(cacheKey);
  console.log(`🗑️ 已清理指定输入的缓存: ${cacheKey.substring(0, 8)}...`);
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  const stats = cache.getStats();
  const isServerless = process.env.VERCEL === '1';

  return {
    ...stats,
    environment: isServerless ? 'Vercel Serverless' : 'Local Development',
    cacheType: isServerless ? 'Memory Cache' : 'File System Cache',
    timestamp: new Date().toISOString()
  };
}

// 默认导出
export default generateFortuneReadingWithCache;