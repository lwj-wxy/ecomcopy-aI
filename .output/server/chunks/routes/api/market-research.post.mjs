import { c as defineEventHandler, u as useRuntimeConfig, e as createError, r as readBody, h as setHeaders, i as sendStream } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const marketResearch_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;
  if (!apiKey || apiKey.includes("MY_DEEPSEEK_API_KEY")) {
    throw createError({ statusCode: 500, statusMessage: "\u670D\u52A1\u5668\u672A\u914D\u7F6E API Key" });
  }
  const body = await readBody(event);
  const { platform, timeframe, language } = body;
  const prompt = `
    You are a top-tier e-commerce market analyst.
    Target Platform: ${platform}
    Timeframe: Last ${timeframe} days
    Output Language: ${language || "Chinese"}
    
    Please analyze and generate a market report for the last ${timeframe} days on this platform.
    The output MUST be a valid JSON object. Use EXACTLY the following keys:
    {
      "lastUpdate": "YYYY-MM-DD",
      "platform": "${platform}",
      "categories": [
        { "category": "Translated Category Name", "searchVolume": 12000, "growth": 15.5 }
      ],
      "products": [
        { "rank": 1, "name": "Translated Product Name", "price": "$29.9", "sales": "1.2k+", "hotpoint": "Translated reason", "thumbnail": "https://picsum.photos/seed/product/100/100" }
      ],
      "insights": [
        "Insight in ${language === "English" ? "English" : language || "Chinese"}",
        "Insight in ${language === "English" ? "English" : language || "Chinese"}"
      ]
    }
    
    Requirements:
    1. categories contains 10 high-potential categories.
    2. products contains 10 current best-selling product samples.
    3. Insights must be high-value, specific, and actionable.
    4. Return ONLY the raw JSON object, no markdown blocks, no prefix text.
    5. THE ENTIRE CONTENT MUST BE IN ${language === "English" ? "English" : language || "Chinese"}.
  `;
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a professional e-commerce data analyst. Return ONLY a valid JSON object." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        stream: true
      })
    });
    if (!response.ok || !response.body) {
      throw new Error("\u65E0\u6CD5\u4ECE DeepSeek \u83B7\u53D6\u6D41");
    }
    setHeaders(event, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    });
    return sendStream(event, response.body);
  } catch (error) {
    console.error("Market Research API Error:", error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});

export { marketResearch_post as default };
//# sourceMappingURL=market-research.post.mjs.map
