import { c as defineEventHandler, u as useRuntimeConfig, e as createError, r as readBody, h as setHeaders, i as sendStream } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const generate_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey;
  if (!apiKey || apiKey.includes("MY_DEEPSEEK_API_KEY")) {
    throw createError({ statusCode: 500, statusMessage: "\u670D\u52A1\u5668\u672A\u914D\u7F6E API Key" });
  }
  const body = await readBody(event);
  const toneMap = {
    "professional": "\u4E13\u4E1A\u4E14\u53EF\u9760 (Professional & Reliable)",
    "emotional": "\u611F\u6027\u4E14\u6E29\u99A8 (Emotional & Warm)",
    "premium": "\u6781\u7B80\u4E14\u9AD8\u7AEF (Minimalist & Premium)"
  };
  const toneText = toneMap[body.tone] || body.tone;
  const prompt = `
    \u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u7535\u5546\u6587\u6848\u4E13\u5BB6\u3002
    \u53D1\u5E03\u5E73\u53F0: ${body.platform}
    \u4EA7\u54C1\u540D\u79F0: ${body.productName}
    \u6838\u5FC3\u5356\u70B9: ${body.features}
    \u76EE\u6807\u53D7\u4F17: ${body.targetAudience}
    \u6587\u6848\u8BED\u6C14: ${toneText}
    \u8F93\u51FA\u8BED\u8A00: ${body.language}
    
    \u8BF7\u6839\u636E\u4EE5\u4E0A\u53C2\u6570\uFF0C\u751F\u6210\u7B26\u5408\u8BE5\u5E73\u53F0\u8C03\u6027\u548C\u53D7\u4F17\u504F\u597D\u7684\u4E13\u4E1A\u6587\u6848\u3002
    \u5FC5\u987B\u4F7F\u7528 ${body.language} \u8FDB\u884C\u8F93\u51FA\u3002
    
    \u8FD4\u56DE JSON \u683C\u5F0F\uFF1A
    {
      "title": "SEO \u4F18\u5316\u7684\u6807\u9898",
      "description": "\u5438\u5F15\u4EBA\u7684\u4EA7\u54C1\u63CF\u8FF0",
      "tags": ["\u6838\u5FC3\u6807\u7B7E1", "\u6807\u7B7E2"],
      "socialCopy": "\u4E00\u6BB5\u9002\u5408\u5206\u4EAB\u5230\u793E\u4EA4\u5A92\u4F53\u7684\u63A8\u5E7F\u6587\u6848"
    }
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
          { role: "system", content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u7535\u5546\u6587\u6848\u4E13\u5BB6\u3002\u53EA\u8FD4\u56DE JSON\u3002" },
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
      // 关键：告知 Nginx/代理不要缓存响应
    });
    return sendStream(event, response.body);
  } catch (error) {
    console.error("API Stream Error:", error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});

export { generate_post as default };
//# sourceMappingURL=generate.post.mjs.map
