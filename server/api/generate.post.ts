import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;

  if (!apiKey || apiKey.includes('MY_DEEPSEEK_API_KEY')) {
    throw createError({ statusCode: 500, statusMessage: '服务器未配置 API Key' });
  }

  const body = await readBody(event);
  
  const prompt = `
    你是一个专业的电商文案专家。
    发布平台: ${body.platform}
    产品名称: ${body.productName}
    核心卖点: ${body.features}
    目标受众: ${body.targetAudience}
    文案语气: ${body.tone}
    输出语言: ${body.language}
    
    请根据以上参数，生成符合该平台调性和受众偏好的专业文案。
    必须使用 ${body.language} 进行输出。
    
    返回 JSON 格式：
    {
      "title": "SEO 优化的标题",
      "description": "吸引人的产品描述",
      "tags": ["核心标签1", "标签2"],
      "socialCopy": "一段适合分享到社交媒体的推广文案"
    }
  `;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个专业的电商文案专家。只返回 JSON。" },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      throw new Error('无法从 DeepSeek 获取流');
    }

    // 设置关键的防缓存响应头，强制实时传输
    setHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // 关键：告知 Nginx/代理不要缓存响应
    });

    // 将 ReadableStream 转换为 Nitro 可以正确流式输出的格式
    return sendStream(event, response.body);

  } catch (error: any) {
    console.error('API Stream Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
