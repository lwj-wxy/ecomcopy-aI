import { c as defineEventHandler, u as useRuntimeConfig, e as createError, r as readBody, h as setHeaders, i as sendStream } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const keywords_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;
  if (!apiKey || apiKey.includes("MY_DEEPSEEK_API_KEY")) {
    throw createError({ statusCode: 500, statusMessage: "\u670D\u52A1\u5668\u672A\u914D\u7F6E API Key" });
  }
  const body = await readBody(event);
  const targetLang = body.language || "\u4E2D\u6587";
  const prompt = `
    \u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684 SEO \u548C\u7535\u5546\u5173\u952E\u8BCD\u4E13\u5BB6\u3002
    \u9488\u5BF9\u4EA7\u54C1: "${body.productName}"\uFF0C\u8BF7\u8FDB\u884C\u6DF1\u5EA6\u5173\u952E\u8BCD\u8C03\u7814\u548C\u4F18\u5316\u5EFA\u8BAE\u3002
    
    \u8F93\u51FA\u8BED\u8A00\uFF1A${targetLang}
    
    \u8BF7\u8F93\u51FA\u4EE5\u4E0B JSON \u683C\u5F0F\uFF1A
    {
      "summary": {
        "total": 20,
        "avgCompetition": "\u4E2D\u7B49",
        "topRecommendation": "\u6838\u5FC3\u8BCD"
      },
      "categories": [
        {
          "name": "\u6838\u5FC3\u9AD8\u8F6C\u5316\u8BCD",
          "keywords": [
            {"term": "\u5173\u952E\u8BCD", "volume": "\u9884\u4F30\u641C\u7D22\u91CF", "competition": 0.8, "score": 95, "intent": "\u8D2D\u4E70", "reason": "\u63A8\u8350\u7406\u7531"}
          ]
        },
        {
          "name": "\u957F\u5C3E\u6D41\u91CF\u8BCD",
          "keywords": []
        },
        {
          "name": "\u7ADE\u54C1\u5173\u8054\u8BCD",
          "keywords": []
        }
      ]
    }
    
    \u6CE8\u610F\uFF1A
    1. competition \u662F 0-1 \u4E4B\u95F4\u7684\u6570\u5B57\uFF0C1 \u4EE3\u8868\u7ADE\u4E89\u6781\u5927\u3002
    2. score \u662F 0-100 \u7684\u673A\u4F1A\u5F97\u5206\uFF0C\u8D8A\u9AD8\u8D8A\u503C\u5F97\u6295\u5165\u3002
    3. \u53EA\u8FD4\u56DE JSON \u4E14\u5FC5\u987B\u7B26\u5408\u7ED3\u6784\u3002
    4. \u6240\u6709\u663E\u793A\u7684\u6587\u672C\u5185\u5BB9\uFF08\u5305\u62EC\u7C7B\u76EE\u540D\u3001\u603B\u7ED3\u3001\u7406\u7531\u7B49\uFF09\u5FC5\u987B\u4F7F\u7528\u6307\u5B9A\u7684\u8F93\u51FA\u8BED\u8A00\uFF1A${targetLang}\u3002
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
          { role: "system", content: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u7535\u5546 SEO \u4E13\u5BB6\u3002\u4F60\u5FC5\u987B\u4EE5${targetLang}\u56DE\u7B54\u5E76\u53EA\u8FD4\u56DE JSON\u3002` },
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
    console.error("Keywords API Error:", error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});

export { keywords_post as default };
//# sourceMappingURL=keywords.post.mjs.map
