import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
  // 清除本地 Cookie
  deleteCookie(event, 'auth_token', {
    path: '/'
  });

  // 模拟清除 Redis 中的 Session (实际应用中应根据 token 找到并删除)
  console.log('Server: Session cleared from Redis (simulated)');

  return {
    success: true,
    message: '已退出登录'
  };
});
