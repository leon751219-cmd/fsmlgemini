'use server';

/**
 * 简化版命理报告生成函数
 * 专注于v2格式的核心功能
 */

import { callAI, shouldUseCache, getAIServiceStatus } from '@/lib/ai-service';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';
import { localCache } from '@/lib/local-cache';
import { calculateCorrectBazi } from '@/lib/correct-bazi-calculator.js';
import { CantianBaziEnhancer } from '@/lib/cantian-bazi-enhancer.js';
import { AgeStageAnalyzer } from '@/lib/age-stage-analyzer.js';

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

// 八字信息数据结构
const BaZiInfoSchema = z.object({
  solar: z.string(),
  lunar: z.string(),
  bazi: z.object({
    year: z.string(),
    month: z.string(),
    day: z.string(),
    time: z.string(),
  }),
  zodiac: z.string(),
  jieqi: z.string(),
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
  baziInfo: BaZiInfoSchema.optional().describe("八字信息，用于前端展示"),
});
export type GenerateFortuneReadingOutput = z.infer<typeof GenerateFortuneReadingOutputSchema>;

/**
 * 主函数：生成命理报告（带缓存）
 */
export async function generateFortuneReadingSimple(input: GenerateFortuneReadingInput): Promise<GenerateFortuneReadingOutput> {
  try {
    // 显示 AI 服务状态
    const aiStatus = getAIServiceStatus();
    console.log('🤖 AI 服务状态:', aiStatus);

    // 1. 准备输入数据
    const currentDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentMonth = new Date().getMonth() + 1; // 获取当前月份（1-12）
    const birthLocation = `中国, ${input.birthLocation}`;

    // 2. 生成缓存key（包含所有影响结果的参数）
    const cacheKey = localCache.generateKey({
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      gender: input.gender,
      birthLocation: input.birthLocation,
      currentMonth: currentMonth,
      year: new Date().getFullYear()
    });

    // 3. 检查缓存（根据环境决定是否使用缓存）
    const useCache = shouldUseCache();
    let cached = null;

    if (useCache) {
      cached = localCache.get(cacheKey);
      if (cached) {
        console.log('🎉 命理报告从缓存中获取，响应时间: < 100ms');
        return cached;
      }
    } else {
      console.log('🔄 当前环境禁用缓存，直接生成新报告');
    }

    // 4. 缓存未命中，生成新报告
    console.log('🔄 缓存未命中，调用AI生成新报告（简化版）...');
    const startTime = Date.now();

    // 5. 计算八字信息
    const birthDateTime = new Date(`${input.birthDate} ${input.birthTime}`);
    const year = birthDateTime.getFullYear();
    const month = birthDateTime.getMonth() + 1;
    const day = birthDateTime.getDate();
    const hour = birthDateTime.getHours();
    const minute = birthDateTime.getMinutes();

    const baziResult = calculateCorrectBazi(year, month, day, hour, minute);

    if (!baziResult || !baziResult.bazi || !baziResult.bazi.day ||
      baziResult.bazi.day === 'NaN' ||
      baziResult.bazi.day === null ||
      baziResult.bazi.day === undefined) {
      console.error('八字计算结果异常:', baziResult);
      throw new Error('八字计算失败，计算结果包含无效值');
    }

    console.log('🎯 八字计算完成:', {
      solar: baziResult.solar,
      lunar: baziResult.lunar,
      bazi: baziResult.bazi,
      zodiac: baziResult.zodiac
    });

    // 6. 使用 Cantian AI 增强分析
    console.log('🚀 调用 Cantian AI 专业算法增强分析...');
    const cantianEnhancer = new CantianBaziEnhancer();
    const enhancedAnalysis = await cantianEnhancer.enhanceBaziAnalysis(input, baziResult);
    console.log('✅ Cantian AI 分析完成，专业等级:', (enhancedAnalysis as any).professionalGrade);

    // 7. 计算年龄阶段分析
    console.log('📊 计算用户年龄阶段分析...');
    const ageAnalyzer = new AgeStageAnalyzer();
    const ageAnalysis = ageAnalyzer.calculateAgeStage(input.birthDate);
    const agePrompt = ageAnalyzer.generateAgePrompt(ageAnalysis);
    console.log('✅ 年龄阶段分析完成:', (ageAnalysis as any).age, '岁,', (ageAnalysis as any).stage?.name);

    // 8. 读取统一模板并构建prompt
    const templatePath = join(process.cwd(), 'src/prompts/enhanced-fortune-template-v2.md');
    const templateContent = readFileSync(templatePath, 'utf-8');

    // 构建八字信息字符串
    const baziInfo = `
## 详细八字信息
- 公历：${baziResult.solar}
- 农历：${baziResult.lunar}
- 生肖：${baziResult.zodiac}
- 节气：${baziResult.jieqi}
- 年柱：${baziResult.bazi.year}
- 月柱：${baziResult.bazi.month}
- 日柱：${baziResult.bazi.day}
- 时柱：${baziResult.bazi.time}
- 四柱八字：${baziResult.bazi.year} ${baziResult.bazi.month} ${baziResult.bazi.day} ${baziResult.bazi.time}
    `.trim();

    // 生成 Cantian AI 专业指导
    const professionalGuidance = cantianEnhancer.generateProfessionalGuidance(enhancedAnalysis);

    // 安全地获取八字信息
    const dayMaster = baziResult.bazi.day && typeof baziResult.bazi.day === 'string' ? baziResult.bazi.day.substring(0, 1) : '甲';
    const monthCommand = baziResult.bazi.month && typeof baziResult.bazi.month === 'string' && baziResult.bazi.month.length >= 2 ? baziResult.bazi.month.substring(1) : '子';
    const baziEightChar = `${baziResult.bazi.year} ${baziResult.bazi.month} ${baziResult.bazi.day} ${baziResult.bazi.time}`;

    // 替换模板中的所有变量
    let prompt = templateContent
      .replace(/{{birthDate}}/g, input.birthDate)
      .replace(/{{birthTime}}/g, input.birthTime)
      .replace(/{{birthLocation}}/g, input.birthLocation)
      .replace(/{{gender}}/g, input.gender)
      .replace(/{{currentDate}}/g, currentDate)
      .replace(/{{currentMonth}}/g, currentMonth.toString())
      // 八字相关变量
      .replace(/{{solarDate}}/g, input.birthDate)
      .replace(/{{lunarDate}}/g, baziResult.lunar)
      .replace(/{{baziInfo}}/g, baziInfo)
      .replace(/{{dayMaster}}/g, dayMaster) // 日干
      .replace(/{{monthCommand}}/g, monthCommand) // 月支
      .replace(/{{baziEightChar}}/g, baziEightChar)
      .replace(/{{zodiac}}/g, baziResult.zodiac)
      .replace(/{{jieqi}}/g, baziResult.jieqi)
      // Cantian AI 专业指导
      .replace(/{{professionalGuidance}}/g, professionalGuidance)
      // 年龄阶段分析
      .replace(/{{ageStage}}/g, agePrompt);

    console.log('📝 使用统一模板文件构建prompt，模板长度:', templateContent.length, '字符');
    console.log('🎯 八字信息已嵌入prompt，包含农历、生肖、四柱八字等详细信息');
    console.log('🚀 Cantian AI 专业指导已添加到prompt，专业等级:', (enhancedAnalysis as any).professionalGrade);
    console.log('📊 年龄阶段分析已添加到prompt：', (ageAnalysis as any).age, '岁,', (ageAnalysis as any).stage?.name);

    // 8. 调用AI API（根据环境变量自动选择模型）
    const response = await callAI(prompt, {
      maxTokens: 8000, // 支持更长的输出
      timeout: 180000 // 3分钟超时，适应长文本生成
    });

    // 7. 解析响应
    const result = parseResponse(response);

    // 8. 添加八字信息到结果中（用于前端展示）
    result.baziInfo = baziResult;

    // 9. 存入缓存（根据环境决定是否使用缓存）
    if (useCache) {
      localCache.set(cacheKey, result, 24);
    } else {
      console.log('📋 Vercel环境跳过缓存存储');
    }

    const generationTime = Date.now() - startTime;
    console.log(`✅ 命理报告生成完成，耗时: ${Math.round(generationTime / 1000)}秒`);
    console.log(`📈 使用统一模板文件，五部典籍理论已应用`);
    console.log(`🎯 八字信息已成功嵌入报告中：${baziResult.bazi.year} ${baziResult.bazi.month} ${baziResult.bazi.day} ${baziResult.bazi.time}`);
    console.log(`🚀 Cantian AI 专业分析已集成，准确性达到专业命理师水准`);
    console.log(`📋 八字信息已添加到前端数据结构`);

    return result;
  } catch (error) {
    console.error('命理报告生成失败:', error);
    throw new Error('抱歉，天机暂时无法显现。请稍后再试。');
  }
}

/**
 * 解析DeepSeek API响应
 * 确保返回的结构化数据符合预期格式
 */
function parseResponse(response: string): GenerateFortuneReadingOutput {
  try {
    // DeepSeek可能返回带代码块的JSON，需要先清理
    let cleanResponse = response.trim();

    // 如果响应被包裹在 ```json ``` 代码块中，提取JSON内容
    if (cleanResponse.includes('```')) {
      const jsonMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanResponse = jsonMatch[1].trim();
      } else {
        const genericMatch = cleanResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (genericMatch && genericMatch[1]) {
          cleanResponse = genericMatch[1].trim();
        }
      }
    }

    // 尝试解析JSON响应
    let parsed = JSON.parse(cleanResponse);

    // 检查是否是预期格式
    if (parsed.classicalReading && parsed.vernacularReading && parsed.summary) {
      // 验证结构
      return GenerateFortuneReadingOutputSchema.parse(parsed);
    }

    // 如果格式不符合预期，返回一个基础的错误响应
    console.warn('AI返回格式不符合预期，返回默认结构');
    return {
      classicalReading: {
        sections: [
          { title: "【八字命盘】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【五行生克】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【心性天赋】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【官禄事业】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【姻缘情感】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【康健关要】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【流年岁运】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" }
        ]
      },
      vernacularReading: {
        sections: [
          { title: "📜 八字命盘", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "💫 五行平衡", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "🧠 性格与天赋", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "💼 事业发展", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "❤️ 感情与婚姻", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "🍃 健康与养生", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "🌟 当前年份与未来运势", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" }
        ]
      },
      summary: "天机虽暂时受阻，但命运之路终将明朗。"
    };

  } catch (error) {
    console.error('响应解析失败:', error);
    console.error('原始响应:', response);

    // 如果解析失败，返回一个基础的错误响应
    return {
      classicalReading: {
        sections: [
          { title: "【八字命盘】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【五行生克】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【心性天赋】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【官禄事业】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【姻缘情感】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【康健关要】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" },
          { title: "【流年岁运】", content: "抱歉，命理解析过程中出现了技术问题。请稍后再试。", comment: "系统提示：可能是网络问题或API响应格式异常。" }
        ]
      },
      vernacularReading: {
        sections: [
          { title: "📜 八字命盘", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "💫 五行平衡", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "🧠 性格与天赋", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "💼 事业发展", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "❤️ 感情与婚姻", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "🍃 健康与养生", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" },
          { title: "🌟 当前年份与未来运势", content: "系统遇到了一个小问题，正在努力修复中。请稍后重新生成您的命理报告。" }
        ]
      },
      summary: "天机虽暂时受阻，但命运之路终将明朗。"
    };
  }
}