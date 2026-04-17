import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;

  if (!apiKey || apiKey.includes('MY_DEEPSEEK_API_KEY')) {
    throw createError({ statusCode: 500, statusMessage: '服务器未配置 API Key' });
  }

  const body = await readBody(event);
  
  const prompt = `
    你是一个顶级的电商竞争情报分析师。
    针对以下产品和竞争信息进行深度分析：
    我的产品: "${body.productName}"
    主要竞争对手或痛点描述: "${body.competitorInfo}"
    
    请输出以下 JSON 格式：
    {
      "comparison": {
        "score": { "mine": 85, "competitor": 78 },
        "metrics": [
          { "name": "价格竞争力", "mine": 90, "competitor": 80, "comment": "我方更有价格优势" },
          { "name": "文案吸引力", "mine": 85, "competitor": 88, "comment": "对手文案情感化更强" },
          { "name": "关键词覆盖", "mine": 70, "competitor": 92, "comment": "对方在长尾词上表现更好" }
        ]
      },
      "swot": {
        "strengths": ["我方核心优势1", "优势2"],
        "weaknesses": ["我方劣势1", "劣势2"],
        "opportunities": ["市场机会点1", "机会2"],
        "threats": ["潜在业务威胁1", "威胁2"]
      },
      "strategies": [
        { "title": "策略1", "action": "具体建议步骤", "impact": "高" }
      ]
    }
    
    注意：
    1. Score 和 Metrics 中的数字是 0-100。
    2. 只返回 JSON 且必须符合结构。
    3. 分析要尖锐且具有可操作性。
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
          { role: "system", content: "你是一个专业的电商竞争分析专家。只返回 JSON。" },
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
    console.error('Competitor API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
