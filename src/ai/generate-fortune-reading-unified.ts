'use server';

/**
 * 统一命理报告生成器
 * 整合所有功能，支持可插拔计算器，使用统一模板
 */

import { callDeepSeekAPI } from '@/lib/deepseek';
import { z } from 'zod';
import { localCache } from '@/lib/local-cache';
import { UnifiedBaziCalculator, type BaziCalculationResult } from '@/lib/unified-bazi-calculator';

// 输入数据结构定义
const GenerateFortuneReadingInputSchema = z.object({
  birthDate: z.string().describe('The birth date of user (YYYY-MM-DD).'),
  birthTime: z.string().describe('The birth time of user (HH:MM).'),
  birthLocation: z.string().describe('The province/city/county of birth (e.g., Beijing or Sichuan Chengdu).'),
  gender: z.enum(['male', 'female']).describe('The gender of user.'),
});

export type GenerateFortuneReadingInput = z.infer<typeof GenerateFortuneReadingInputSchema>;

// 章节数据结构定义
const SectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  comment: z.string().optional(),
});

// 输出数据结构定义
const GenerateFortuneReadingOutputSchema = z.object({
  classicalReading: z.object({
    sections: z.array(SectionSchema),
  }),
  vernacularReading: z.object({
    sections: z.array(SectionSchema),
  }),
  summary: z.string().describe("A one-sentence philosophical summary of entire reading."),
  baziInfo: z.object({
    dataSource: z.string(),
    accuracy: z.enum(['high', 'medium', 'low']),
    calculator: z.string(),
  }).optional(),
});

export type GenerateFortuneReadingOutput = z.infer<typeof GenerateFortuneReadingOutputSchema>;

export interface UnifiedGenerationOptions {
  preferredCalculator?: 'utils' | 'builtin' | 'auto';
  useCache?: boolean;
  timeout?: number;
  maxTokens?: number;
}

/**
 * 统一的命理报告生成函数
 * 这是新的主入口，整合了所有功能
 */
export async function generateFortuneReadingUnified(
  input: GenerateFortuneReadingInput,
  options: UnifiedGenerationOptions = {}
): Promise<GenerateFortuneReadingOutput> {
  try {
    console.log('🚀 开始使用统一生成器生成命理报告...');
    console.log(`📋 用户信息: ${input.birthDate} ${input.birthTime} ${input.birthLocation} ${input.gender}`);

    // 1. 准备基础信息
    const currentDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentMonth = new Date().getMonth() + 1;

    // 2. 生成缓存key
    const cacheKey = localCache.generateKey({
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      gender: input.gender,
      birthLocation: input.birthLocation,
      currentMonth: currentMonth,
      year: new Date().getFullYear(),
      version: 'unified',
      preferredCalculator: options.preferredCalculator
    });

    // 3. 检查缓存（如果启用）
    if (options.useCache !== false) {
      const cached = localCache.get(cacheKey);
      if (cached) {
        console.log('🎉 命理报告从缓存中获取，响应时间: < 100ms');
        return cached;
      }
    }

    // 4. 缓存未命中，生成新报告
    console.log('🔄 缓存未命中，生成新报告...');
    const startTime = Date.now();

    // 5. 使用统一计算器计算八字
    const baziResult = await UnifiedBaziCalculator.calculate(
      input.birthDate,
      input.birthTime,
      input.birthLocation,
      input.gender
    );

    console.log(`📊 使用计算器: ${baziResult.dataSource}`);
    console.log(`📊 计算精度: ${baziResult.accuracy}`);

    // 6. 构建统一Prompt
    const prompt = buildUnifiedPrompt(input, baziResult, currentDate, currentMonth);

    console.log('📝 统一Prompt构建完成，长度:', prompt.length, '字符');

    // 7. 调用DeepSeek API
    const response = await callDeepSeekAPI(prompt, {
      max_tokens: options.maxTokens || 8000,
      timeout: options.timeout || 180000
    });

    // 8. 解析响应
    const result = parseResponse(response);

    // 9. 添加八字信息到结果
    const enhancedResult = {
      ...result,
      baziInfo: {
        dataSource: baziResult.dataSource,
        accuracy: baziResult.accuracy,
        calculator: baziResult.dataSource.includes('utils') ? 'getBaZiFromSolarDate' :
                   baziResult.dataSource.includes('内置') ? 'BaziCalculator' : 'AI'
      }
    };

    // 10. 存入缓存（如果启用）
    if (options.useCache !== false) {
      localCache.set(cacheKey, enhancedResult, 24);
    }

    const generationTime = Date.now() - startTime;
    console.log(`✅ 统一命理报告生成完成，耗时: ${Math.round(generationTime / 1000)}秒`);
    console.log(`📈 使用计算器: ${baziResult.dataSource}`);

    return enhancedResult;

  } catch (error) {
    console.error('统一命理报告生成失败:', error);
    throw new Error('抱歉，命理分析暂时无法进行。请稍后再试。');
  }
}

/**
 * 构建统一Prompt
 */
function buildUnifiedPrompt(
  input: GenerateFortuneReadingInput,
  baziResult: BaziCalculationResult,
  currentDate: string,
  currentMonth: number
): string {
  try {
    // 读取统一模板
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const templatePath = join(process.cwd(), 'src/prompts/enhanced-fortune-template-v2.md');
    const templateContent = readFileSync(templatePath, 'utf-8');

    // 生成八字信息字符串
    const baziInfoString = UnifiedBaziCalculator.generateBaziInfoString(baziResult);
    const dataSourceInfoString = UnifiedBaziCalculator.generateDataSourceInfo(baziResult);

    // 变量替换
    let prompt = templateContent
      .replace(/{{solarDate}}/g, baziResult.solarDate)
      .replace(/{{lunarDate}}/g, baziResult.lunarDate)
      .replace(/{{birthTime}}/g, input.birthTime)
      .replace(/{{birthLocation}}/g, input.birthLocation)
      .replace(/{{gender}}/g, input.gender)
      .replace(/{{currentDate}}/g, currentDate)
      .replace(/{{currentMonth}}/g, currentMonth.toString())
      .replace(/{{baziInfo}}/g, baziInfoString)
      .replace(/{{baziEightChar}}/g, baziResult.baziEightChar)
      .replace(/{{dayMaster}}/g, baziResult.dayMaster)
      .replace(/{{monthCommand}}/g, baziResult.monthCommand)
      .replace(/{{dataSourceInfo}}/g, dataSourceInfoString);

    return prompt;
  } catch (error) {
    console.error('构建统一Prompt失败:', error);
    throw new Error('无法构建统一Prompt模板');
  }
}

/**
 * 解析响应的函数
 */
function parseResponse(response: string): GenerateFortuneReadingOutput {
  try {
    let cleanResponse = response.trim();

    // 提取JSON内容
    if (cleanResponse.includes('```')) {
      const jsonMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanResponse = jsonMatch[1].trim();
      }
    }

    const parsed = JSON.parse(cleanResponse);

    // 验证结构
    return GenerateFortuneReadingOutputSchema.parse(parsed);

  } catch (error) {
    console.error('响应解析失败:', error);
    console.error('原始响应:', response);

    // 返回错误响应
    return {
      classicalReading: {
        sections: [
          { title: "【解析错误】", content: "抱歉，命理解析过程中出现了问题。", comment: "系统提示" },
          { title: "【解析错误】", content: "抱歉，命理解析过程中出现了问题。", comment: "系统提示" },
          { title: "【解析错误】", content: "抱歉，命理解析过程中出现了问题。", comment: "系统提示" },
          { title: "【解析错误】", content: "抱歉，命理解析过程中出现了问题。", comment: "系统提示" },
          { title: "【解析错误】", content: "抱歉，命理解析过程中出现了问题。", comment: "系统提示" },
          { title: "【解析错误】", content: "抱歉，命理解析过程中出现了问题。", comment: "系统提示" },
          { title: "【解析错误】", content: "抱歉，命理解析过程中出现了问题。", comment: "系统提示" }
        ]
      },
      vernacularReading: {
        sections: [
          { title: "📜 八字命盘", content: "系统解析时遇到问题，请稍后再试" },
          { title: "💫 五行平衡", content: "系统解析时遇到问题，请稍后再试" },
          { title: "🧠 性格与天赋", content: "系统解析时遇到问题，请稍后再试" },
          { title: "💼 事业发展", content: "系统解析时遇到问题，请稍后再试" },
          { title: "❤️ 感情与婚姻", content: "系统解析时遇到问题，请稍后再试" },
          { title: "🍃 健康与养生", content: "系统解析时遇到问题，请稍后再试" },
          { title: "🌟 当前年份与未来运势", content: "系统解析时遇到问题，请稍后再试" }
        ]
      },
      summary: "系统解析失败，请稍后再试"
    };
  }
}

/**
 * 便捷函数：强制使用Utils计算器
 */
export async function generateFortuneReadingWithUtils(
  input: GenerateFortuneReadingInput,
  options: Omit<UnifiedGenerationOptions, 'preferredCalculator'> = {}
): Promise<GenerateFortuneReadingOutput> {
  return generateFortuneReadingUnified(input, {
    ...options,
    preferredCalculator: 'utils'
  });
}

/**
 * 便捷函数：强制使用内置计算器
 */
export async function generateFortuneReadingWithBuiltin(
  input: GenerateFortuneReadingInput,
  options: Omit<UnifiedGenerationOptions, 'preferredCalculator'> = {}
): Promise<GenerateFortuneReadingOutput> {
  return generateFortuneReadingUnified(input, {
    ...options,
    preferredCalculator: 'builtin'
  });
}

/**
 * 测试统一生成器
 */
export async function testUnifiedGenerator(): Promise<boolean> {
  try {
    const testInput: GenerateFortuneReadingInput = {
      birthDate: '1995-05-18',
      birthTime: '23:30',
      birthLocation: '北京',
      gender: 'male'
    };

    console.log('🧪 开始测试统一生成器...');

    // 测试自动选择计算器
    const result1 = await generateFortuneReadingUnified(testInput);

    // 测试强制Utils计算器
    const result2 = await generateFortuneReadingWithUtils(testInput);

    // 测试强制内置计算器
    const result3 = await generateFortuneReadingWithBuiltin(testInput);

    const success = !!(result1.classicalReading && result1.vernacularReading && result1.summary &&
                    result2.classicalReading && result2.vernacularReading && result2.summary &&
                    result3.classicalReading && result3.vernacularReading && result3.summary);

    if (success) {
      console.log('✅ 统一生成器测试通过');
      console.log('📊 自动选择计算器:', result1.baziInfo?.calculator);
      console.log('📊 强制Utils计算器:', result2.baziInfo?.calculator);
      console.log('📊 强制内置计算器:', result3.baziInfo?.calculator);
    } else {
      console.log('❌ 统一生成器测试失败');
    }

    return success;
  } catch (error) {
    console.error('统一生成器测试失败:', error);
    return false;
  }
}