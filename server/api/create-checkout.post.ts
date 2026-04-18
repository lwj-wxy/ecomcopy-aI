const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const PADDLE_ENV = process.env.PADDLE_ENV === 'sandbox' ? 'sandbox' : 'production';
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.PADDLE_PRICE_STARTER,
  pro: process.env.PADDLE_PRICE_PRO
};

const PADDLE_API_BASE =
  PADDLE_ENV === 'sandbox' ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ planId?: string; userId?: string; email?: string | null }>(event);
  const planId = body?.planId;
  const userId = body?.userId?.trim();
  const email = body?.email?.trim();

  if (!planId || !(planId in PRICE_IDS)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid planId'
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Please login before upgrading'
    });
  }

  if (!PADDLE_API_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing PADDLE_API_KEY in server environment'
    });
  }

  const priceId = PRICE_IDS[planId];
  if (!priceId) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing Paddle price id for plan: ${planId}`
    });
  }

  const paddleResponse = await fetch(`${PADDLE_API_BASE}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
      'Paddle-Version': '1'
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: 'automatic',
      enable_checkout: true,
      checkout: {
        url: `${SITE_URL}/dashboard`
      },
      custom_data: {
        planId,
        userId,
        ...(email ? { email } : {})
      }
    })
  });

  const paddlePayload: any = await paddleResponse.json().catch(() => ({}));

  if (!paddleResponse.ok) {
    const detail = paddlePayload?.error?.detail || paddlePayload?.error?.code || 'Paddle API error';
    throw createError({
      statusCode: paddleResponse.status || 500,
      statusMessage: detail
    });
  }

  const checkoutUrl = paddlePayload?.data?.checkout?.url;
  if (!checkoutUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Paddle checkout URL missing in API response'
    });
  }

  return { url: checkoutUrl };
});
