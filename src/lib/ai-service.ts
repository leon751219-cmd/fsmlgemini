/**
 * AI 服务选择器
 * 支持根据环境变量选择 Gemini 或 DeepSeek API
 */

import { callDeepSeekAPI } from './deepseek';
import { callGeminiAPI } from './gemini';

export type AIModel = 'gemini' | 'deepseek';

export interface AIConfig {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

/**
 * 获取当前配置的 AI 模型
 */
export function getCurrentAIModel(): AIModel {
  const modelType = process.env.AI_MODEL as AIModel;

  // 检查环境变量配置
  if (modelType === 'gemini' || modelType === 'deepseek') {
    return modelType;
  }

  // 自动检测：如果有 Gemini API Key，优先使用 Gemini
  if (process.env.GOOGLE_API_KEY) {
    return 'gemini';
  }

  // 默认使用 DeepSeek
  return 'deepseek';
}

/**
 * 检查 AI 模型是否可用
 */
export function isAIModelAvailable(model: AIModel): boolean {
  switch (model) {
    case 'gemini':
      return !!process.env.GOOGLE_API_KEY;
    case 'deepseek':
      return !!process.env.DEEPSEEK_API_KEY;
    default:
      return false;
  }
}

/**
 * 获取可用的 AI 模型列表
 */
export function getAvailableAIModels(): AIModel[] {
  const models: AIModel[] = [];

  if (isAIModelAvailable('gemini')) {
    models.push('gemini');
  }

  if (isAIModelAvailable('deepseek')) {
    models.push('deepseek');
  }

  return models;
}

/**
 * 获取降级 AI 模型
 */
export function getFallbackAIModel(primaryModel: AIModel): AIModel | null {
  const availableModels = getAvailableAIModels();

  // 返回第一个可用的模型（排除主模型）
  for (const model of availableModels) {
    if (model !== primaryModel) {
      return model;
    }
  }

  return null;
}

/**
 * 统一的 AI API 调用接口
 */
export async function callAI(
  prompt: string,
  config: AIConfig = {}
): Promise<string> {
  // 确定要使用的模型
  const selectedModel = config.model || getCurrentAIModel();

  console.log(`🎯 选择 AI 模型: ${selectedModel}`);
  console.log(`📋 可用模型: ${getAvailableAIModels().join(', ')}`);

  // 检查所选模型是否可用
  if (!isAIModelAvailable(selectedModel)) {
    console.warn(`⚠️ ${selectedModel} 模型不可用，尝试降级`);

    const fallbackModel = getFallbackAIModel(selectedModel);
    if (fallbackModel) {
      console.log(`🔄 降级到: ${fallbackModel}`);
      return callAIWithModel(prompt, fallbackModel, config);
    }

    throw new Error(`没有可用的 AI 模型。请检查 API 密钥配置。`);
  }

  try {
    return await callAIWithModel(prompt, selectedModel, config);
  } catch (error) {
    console.error(`❌ ${selectedModel} 调用失败:`, error);

    // 尝试降级
    const fallbackModel = getFallbackAIModel(selectedModel);
    if (fallbackModel) {
      console.log(`🔄 ${selectedModel} 失败，降级到: ${fallbackModel}`);
      try {
        return await callAIWithModel(prompt, fallbackModel, config);
      } catch (fallbackError) {
        console.error(`❌ 降级模型 ${fallbackModel} 也失败了:`, fallbackError);
      }
    }

    // 所有尝试都失败
    throw error;
  }
}

/**
 * 使用指定模型调用 AI
 */
async function callAIWithModel(
  prompt: string,
  model: AIModel,
  config: AIConfig
): Promise<string> {
  switch (model) {
    case 'gemini':
      return await callGeminiAPI(prompt, {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        timeout: config.timeout
      });

    case 'deepseek':
      return await callDeepSeekAPI(prompt, {
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        timeout: config.timeout
      });

    default:
      throw new Error(`不支持的 AI 模型: ${model}`);
  }
}

/**
 * 检测部署环境
 */
export function detectEnvironment(): 'vercel' | 'huawei' | 'local' {
  if (process.env.VERCEL === '1') {
    return 'vercel';
  }

  // 可以通过其他环境变量识别华为云
  if (process.env.HUAWEI_CLOUD === '1' || process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return 'huawei';
  }

  return 'local';
}

/**
 * 检测是否应该使用缓存
 */
export function shouldUseCache(): boolean {
  const environment = detectEnvironment();

  // Vercel 环境不使用缓存（无状态）
  if (environment === 'vercel') {
    return false;
  }

  // 本地和华为云环境使用缓存
  return true;
}

/**
 * 获取 AI 服务状态信息
 */
export function getAIServiceStatus() {
  const environment = detectEnvironment();
  const currentModel = getCurrentAIModel();
  const availableModels = getAvailableAIModels();
  const useCache = shouldUseCache();

  return {
    environment,
    currentModel,
    availableModels,
    useCache,
    hasGeminiKey: isAIModelAvailable('gemini'),
    hasDeepSeekKey: isAIModelAvailable('deepseek')
  };
}