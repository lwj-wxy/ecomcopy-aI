import { c as defineEventHandler, u as useRuntimeConfig, e as createError, r as readBody, h as setHeaders, i as sendStream } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const competitor_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;
  if (!apiKey || apiKey.includes("MY_DEEPSEEK_API_KEY")) {
    throw createError({ statusCode: 500, statusMessage: "\u670D\u52A1\u5668\u672A\u914D\u7F6E API Key" });
  }
  const body = await readBody(event);
  const targetLang = body.language || "\u4E2D\u6587";
  const prompt = `
    \u4F60\u662F\u4E00\u4E2A\u9876\u7EA7\u7684\u7535\u5546\u7ADE\u4E89\u60C5\u62A5\u5206\u6790\u5E08\u3002
    \u9488\u5BF9\u4EE5\u4E0B\u4EA7\u54C1\u548C\u7ADE\u4E89\u4FE1\u606F\u8FDB\u884C\u6DF1\u5EA6\u5206\u6790\uFF1A
    \u6211\u7684\u4EA7\u54C1: "${body.productName}"
    \u4E3B\u8981\u7ADE\u4E89\u5BF9\u624B\u6216\u75DB\u70B9\u63CF\u8FF0: "${body.competitorInfo}"
    
    \u8F93\u51FA\u8BED\u8A00\uFF1A${targetLang}
    
    \u8BF7\u8F93\u51FA\u4EE5\u4E0B JSON \u683C\u5F0F\uFF1A
    {
      "comparison": {
        "score": { "mine": 85, "competitor": 78 },
        "metrics": [
          { "name": "\u4EF7\u683C\u7ADE\u4E89\u529B", "mine": 90, "competitor": 80, "comment": "\u6211\u65B9\u66F4\u6709\u4EF7\u683C\u4F18\u52BF" },
          { "name": "\u6587\u6848\u5438\u5F15\u529B", "mine": 85, "competitor": 88, "comment": "\u5BF9\u624B\u6587\u6848\u60C5\u611F\u5316\u66F4\u5F3A" },
          { "name": "\u5173\u952E\u8BCD\u8986\u76D6", "mine": 70, "competitor": 92, "comment": "\u5BF9\u65B9\u5728\u957F\u5C3E\u8BCD\u4E0A\u8868\u73B0\u66F4\u597D" }
        ]
      },
      "swot": {
        "strengths": ["\u6211\u65B9\u6838\u5FC3\u4F18\u52BF1", "\u4F18\u52BF2"],
        "weaknesses": ["\u6211\u65B9\u52A3\u52BF1", "\u52A3\u52BF2"],
        "opportunities": ["\u5E02\u573A\u673A\u4F1A\u70B91", "\u673A\u4F1A2"],
        "threats": ["\u6F5C\u5728\u4E1A\u52A1\u5A01\u80C11", "\u5A01\u80C12"]
      },
      "strategies": [
        { "title": "\u7B56\u75651", "action": "\u5177\u4F53\u5EFA\u8BAE\u6B65\u9AA4", "impact": "\u9AD8" }
      ]
    }
    
    \u6CE8\u610F\uFF1A
    1. Score \u548C Metrics \u4E2D\u7684\u6570\u5B57\u662F 0-100\u3002
    2. \u53EA\u8FD4\u56DE JSON \u4E14\u5FC5\u987B\u7B26\u5408\u7ED3\u6784\u3002
    3. \u5206\u6790\u8981\u5C16\u9510\u4E14\u5177\u6709\u53EF\u64CD\u4F5C\u6027\u3002
    4. \u6240\u6709\u663E\u793A\u7684\u6587\u672C\u5185\u5BB9\uFF08\u6307\u6807\u540D\u79F0\u3001\u8BC4\u8BBA\u3001SWOT\u70B9\u3001\u7B56\u7565\u7B49\uFF09\u5FC5\u987B\u4F7F\u7528\u6307\u5B9A\u7684\u8F93\u51FA\u8BED\u8A00\uFF1A${targetLang}\u3002
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
          { role: "system", content: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u7535\u5546\u7ADE\u4E89\u5206\u6790\u4E13\u5BB6\u3002\u4F60\u5FC5\u987B\u4EE5${targetLang}\u56DE\u7B54\u5E76\u53EA\u8FD4\u56DE JSON\u3002` },
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
    console.error("Competitor API Error:", error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});

export { competitor_post as default };
//# sourceMappingURL=competitor.post.mjs.map
