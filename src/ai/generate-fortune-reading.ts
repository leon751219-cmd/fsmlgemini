'use server';

/**
 * 常清阁命理报告生成 - 主入口文件
 */

import {
  generateFortuneReadingSimple,
  type GenerateFortuneReadingInput,
  type GenerateFortuneReadingOutput
} from './generate-fortune-reading-simple';

// 重新导出类型
export type { GenerateFortuneReadingInput, GenerateFortuneReadingOutput };

// 主要导出函数
export const generateFortuneReading = generateFortuneReadingSimple;

/**
 * 向后兼容的函数别名
 */
export const generateFortuneReadingOriginal = generateFortuneReadingSimple;
export const generateFortuneReadingWithStandardPrompt = generateFortuneReadingSimple;
export const generateFortuneReadingWithUtilsBazi = generateFortuneReadingSimple;

/**
 * 测试函数
 */
export async function testFortuneReading(): Promise<boolean> {
  try {
    const testInput: GenerateFortuneReadingInput = {
      birthDate: '1995-05-18',
      birthTime: '23:30',
      birthLocation: '北京',
      gender: 'male'
    };

    const result = await generateFortuneReading(testInput);
    return !!(result.classicalReading && result.vernacularReading && result.summary);
  } catch (error) {
    console.error('命理生成测试失败:', error);
    return false;
  }
}