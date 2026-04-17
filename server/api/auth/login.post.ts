import { defineEventHandler, readBody, createError, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { idToken, email } = body;

  if (!idToken) {
    throw createError({
      statusCode: 400,
      message: '缺少认证令牌'
    });
  }

  // 在生产环境中，这里应该使用 firebase-admin 验证 idToken
  // 为了演示，我们信任前端传来的已验证 Token 并将其存入 Cookie
  setCookie(event, 'auth_token', idToken, {
    httpOnly: false, // 允许客户端读取，以便 Nuxt 中间件在客户端路由时能正确识别状态
    secure: true,    // 在预览环境（HTTPS）中必须为 true，配合 SameSite: 'none'
    sameSite: 'none', // 必须为 'none' 以支持 iframe 跨域环境
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  return {
    success: true,
    email
  };
});
