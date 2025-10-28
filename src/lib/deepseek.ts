/**
 * DeepSeek API 客户端
 * 提供与 DeepSeek Chat API 的集成
 */

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export interface DeepSeekConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  timeout?: number;
}

const DEFAULT_CONFIG: DeepSeekConfig = {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 8000, // 从4000提升到8000以支持更长的输出
  stream: false,
  timeout: 120000 // 2分钟超时
};

export async function callDeepSeekAPI(
  prompt: string,
  config: DeepSeekConfig = {}
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
  }

  // 合并默认配置和用户配置
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: finalConfig.model,
        messages: [
          {
            role: 'system',
            content: '你是一位精通中国传统命理学的大师，深谙八字、紫微斗数与易经，同时具备现代心理学知识。请严格按照JSON格式返回命理分析结果。输出内容需要详细完整，总字数控制在6000-9000字范围内。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.max_tokens,
        stream: finalConfig.stream,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: DeepSeekError = await response.json();
      throw new Error(`DeepSeek API 错误: ${errorData.error.message} (${response.status})`);
    }

    const data: DeepSeekResponse = await response.json();

    // 记录token使用情况
    console.log(`📊 Token使用情况:`, {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens
    });

    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);

    // 处理超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API调用超时，请稍后重试');
    }

    throw error;
  }
}

/**
 * 高级API调用，支持重试和错误处理
 */
export async function callDeepSeekAPIAdvanced(
  prompt: string,
  config: DeepSeekConfig = {},
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 尝试第${attempt}次API调用...`);
      return await callDeepSeekAPI(prompt, config);
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

  throw lastError || new Error('API调用失败');
}

/**
 * 测试 DeepSeek API 连接
 */
export async function testDeepSeekConnection(): Promise<boolean> {
  try {
    const testResponse = await callDeepSeekAPI('请简单回复"连接正常"');
    return testResponse.includes('连接正常');
  } catch (error) {
    console.error('DeepSeek 连接测试失败:', error);
    return false;
  }
}