import { defineNuxtRouteMiddleware, navigateTo } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token');
  console.log(`Middleware: path=${to.path}, hasToken=${!!token.value}`);

  // 如果访问的是 dashboard 且没有 token，重定向到登录页
  if (to.path === '/dashboard' && !token.value) {
    console.log('Middleware: No token, redirecting to login');
    return navigateTo('/login');
  }

  // 如果已登录且访问登录页，重定向到 dashboard
  if (to.path === '/login' && token.value) {
    return navigateTo('/dashboard');
  }
});
