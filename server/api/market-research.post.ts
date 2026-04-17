import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;

  if (!apiKey || apiKey.includes('MY_DEEPSEEK_API_KEY')) {
    throw createError({ statusCode: 500, statusMessage: '服务器未配置 API Key' });
  }

  const body = await readBody(event);
  const { platform, timeframe } = body;
  
  const prompt = `
    你是一个顶级电商市场分析师。
    当前平台: ${platform}
    时间范围: 最近 ${timeframe} 天
    
    请分析并生成该平台上最近 ${timeframe} 天内的市场报告。
    返回以下 JSON 格式：
    {
      "lastUpdate": "2026-04-17",
      "platform": "${platform}",
      "categories": [
        { "category": "品类名", "searchVolume": 12000, "growth": 15.5 }
      ],
      "products": [
        { "rank": 1, "name": "产品名称", "price": "$29.9", "sales": "1.2k+", "hotpoint": "爆火原因/卖点", "thumbnail": "https://picsum.photos/seed/product1/100/100" }
      ],
      "insights": [
        "洞察1: 关于品类的趋势总结",
        "洞察2: 关于具体单品的共性分析"
      ]
    }
    
    注意：
    1. categories 包含 10 个最具潜力的品类。
    2. products 包含当前销量最高的 10 个具体产品示例。
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
          { role: "system", content: "你是一个专业的电商数据分析师。只返回 JSON。" },
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
    console.error('Market Research API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
