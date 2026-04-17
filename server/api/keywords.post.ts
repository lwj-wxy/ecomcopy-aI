import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;

  if (!apiKey || apiKey.includes('MY_DEEPSEEK_API_KEY')) {
    throw createError({ statusCode: 500, statusMessage: '服务器未配置 API Key' });
  }

  const body = await readBody(event);
  
  const prompt = `
    你是一个专业的 SEO 和电商关键词专家。
    针对产品: "${body.productName}"，请进行深度关键词调研和优化建议。
    
    请输出以下 JSON 格式：
    {
      "summary": {
        "total": 20,
        "avgCompetition": "中等",
        "topRecommendation": "核心词"
      },
      "categories": [
        {
          "name": "核心高转化词",
          "keywords": [
            {"term": "关键词", "volume": "预估搜索量", "competition": 0.8, "score": 95, "intent": "购买", "reason": "推荐理由"}
          ]
        },
        {
          "name": "长尾流量词",
          "keywords": []
        },
        {
          "name": "竞品关联词",
          "keywords": []
        }
      ]
    }
    
    注意：
    1. competition 是 0-1 之间的数字，1 代表竞争极大。
    2. score 是 0-100 的机会得分，越高越值得投入。
    3. 只返回 JSON 且必须符合结构。
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
          { role: "system", content: "你是一个专业的电商 SEO 专家。只返回 JSON。" },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      throw new Error('无法从 DeepSeek 获取流');
    }

    setHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    return sendStream(event, response.body);

  } catch (error: any) {
    console.error('Keywords API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
