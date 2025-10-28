/**
 * Gemini API 客户端
 * 提供与 Google Gemini API 的集成
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: GeminiConfig = {
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 8000,
  timeout: 180000 // 3分钟超时
};

export async function callGeminiAPI(
  prompt: string,
  config: GeminiConfig = {}
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY 环境变量未设置');
  }

  // 合并默认配置和用户配置
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    console.log('🔄 调用 Gemini API...');
    const startTime = Date.now();

    // 初始化 Gemini 客户端
    const genAI = new GoogleGenerativeAI(apiKey);
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: finalConfig.model!,
      generationConfig: {
        temperature: finalConfig.temperature,
        maxOutputTokens: finalConfig.maxTokens,
      }
    });

    // 调用 API
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const generationTime = Date.now() - startTime;
    console.log(`✅ Gemini API 调用成功，耗时: ${Math.round(generationTime / 1000)}秒`);
    console.log(`📊 响应长度: ${response.length} 字符`);

    return response;

  } catch (error) {
    console.error('Gemini API 调用失败:', error);

    // 处理特定错误
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        throw new Error('Gemini API密钥无效或未设置');
      }
      if (error.message.includes('quota')) {
        throw new Error('Gemini API 配额已用完');
      }
      if (error.message.includes('timeout') || error.message.includes('deadline')) {
        throw new Error('Gemini API 调用超时，请稍后重试');
      }
    }

    throw new Error(`Gemini API 错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 高级API调用，支持重试和错误处理
 */
export async function callGeminiAPIAdvanced(
  prompt: string,
  config: GeminiConfig = {},
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 尝试第${attempt}次 Gemini API调用...`);
      return await callGeminiAPI(prompt, config);
    } catch (error) {
      lastError = error as Error;
      console.error(`第${attempt}次调用失败:`, error);

      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避，最大5秒
        console.log(`等待${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Gemini API 调用失败');
}

/**
 * 测试 Gemini API 连接
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const testResponse = await callGeminiAPI('请简单回复"连接正常"');
    return testResponse.includes('连接正常');
  } catch (error) {
    console.error('Gemini 连接测试失败:', error);
    return false;
  }
}