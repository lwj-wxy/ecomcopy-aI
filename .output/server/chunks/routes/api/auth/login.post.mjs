import { c as defineEventHandler, r as readBody, e as createError, f as setCookie } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { idToken, email } = body;
  if (!idToken) {
    throw createError({
      statusCode: 400,
      message: "\u7F3A\u5C11\u8BA4\u8BC1\u4EE4\u724C"
    });
  }
  setCookie(event, "auth_token", idToken, {
    httpOnly: false,
    // 允许客户端读取，以便 Nuxt 中间件在客户端路由时能正确识别状态
    secure: true,
    // 在预览环境（HTTPS）中必须为 true，配合 SameSite: 'none'
    sameSite: "none",
    // 必须为 'none' 以支持 iframe 跨域环境
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });
  return {
    success: true,
    email
  };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
