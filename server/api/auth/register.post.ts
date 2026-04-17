import { defineEventHandler, readBody, setCookie, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { idToken, email } = body;

  if (!idToken) {
    throw createError({
      statusCode: 400,
      message: '缺少认证令牌'
    });
  }
  
  setCookie(event, 'auth_token', idToken, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  return {
    success: true,
    email
  };
});
