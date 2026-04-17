export default defineEventHandler(() => {
  return { status: 'pong', time: new Date().toISOString() };
});
