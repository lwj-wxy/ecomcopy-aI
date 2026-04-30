import { c as defineEventHandler, r as readBody, e as createError } from '../../_/nitro.mjs';
import { e as ensureServerEnvLoaded } from '../../_/load-env.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'dotenv';

var _a, _b;
ensureServerEnvLoaded();
const PADDLE_ENV = process.env.PADDLE_ENV === "sandbox" ? "sandbox" : "production";
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const PADDLE_CHECKOUT_URL = (_a = process.env.PADDLE_CHECKOUT_URL) == null ? void 0 : _a.trim();
const PUBLIC_SITE_URL = (_b = process.env.NUXT_PUBLIC_SITE_URL) == null ? void 0 : _b.trim();
const RESOLVED_CHECKOUT_URL = PADDLE_CHECKOUT_URL || (PUBLIC_SITE_URL ? `${PUBLIC_SITE_URL.replace(/\/+$/, "")}/pay` : "");
const PRICE_IDS = {
  starter: process.env.PADDLE_PRICE_STARTER,
  pro: process.env.PADDLE_PRICE_PRO
};
const PADDLE_API_BASE = PADDLE_ENV === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";
const createCheckout_post = defineEventHandler(async (event) => {
  var _a2, _b2, _c, _d, _e, _f;
  const body = await readBody(event);
  const planId = body == null ? void 0 : body.planId;
  const userId = (_a2 = body == null ? void 0 : body.userId) == null ? void 0 : _a2.trim();
  const email = (_b2 = body == null ? void 0 : body.email) == null ? void 0 : _b2.trim();
  if (!planId || !(planId in PRICE_IDS)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid planId"
    });
  }
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please login before upgrading"
    });
  }
  if (!PADDLE_API_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing PADDLE_API_KEY in server environment"
    });
  }
  const priceId = PRICE_IDS[planId];
  if (!priceId) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing Paddle price id for plan: ${planId}`
    });
  }
  const transactionPayload = {
    items: [{ price_id: priceId, quantity: 1 }],
    collection_mode: "automatic",
    enable_checkout: true,
    custom_data: {
      planId,
      userId,
      ...email ? { email } : {}
    }
  };
  if (RESOLVED_CHECKOUT_URL) {
    transactionPayload.checkout = { url: RESOLVED_CHECKOUT_URL };
  }
  const requestHeaders = {
    Authorization: `Bearer ${PADDLE_API_KEY}`,
    "Content-Type": "application/json",
    "Paddle-Version": "1"
  };
  const createTransaction = async (payload) => {
    const response = await fetch(`${PADDLE_API_BASE}/transactions`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(payload)
    });
    const body2 = await response.json().catch(() => ({}));
    return { response, body: body2 };
  };
  let { response: paddleResponse, body: paddlePayload } = await createTransaction(transactionPayload);
  if (!paddleResponse.ok) {
    const detail = ((_c = paddlePayload == null ? void 0 : paddlePayload.error) == null ? void 0 : _c.detail) || ((_d = paddlePayload == null ? void 0 : paddlePayload.error) == null ? void 0 : _d.code) || "Paddle API error";
    throw createError({
      statusCode: paddleResponse.status || 500,
      statusMessage: detail
    });
  }
  const checkoutUrl = (_f = (_e = paddlePayload == null ? void 0 : paddlePayload.data) == null ? void 0 : _e.checkout) == null ? void 0 : _f.url;
  if (!checkoutUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "Paddle checkout URL missing in API response"
    });
  }
  return { url: checkoutUrl };
});

export { createCheckout_post as default };
//# sourceMappingURL=create-checkout.post.mjs.map
