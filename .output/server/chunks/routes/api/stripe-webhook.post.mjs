import { c as defineEventHandler, e as createError, j as getHeader, k as readRawBody } from '../../_/nitro.mjs';
import Stripe from 'stripe';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
let stripe = null;
const stripeWebhook_post = defineEventHandler(async (event) => {
  var _a, _b;
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    throw createError({ statusCode: 500, statusMessage: "Stripe keys missing" });
  }
  if (!stripe) stripe = new Stripe(STRIPE_SECRET_KEY);
  const signature = getHeader(event, "stripe-signature");
  const body = await readRawBody(event);
  if (!signature || !body) {
    throw createError({ statusCode: 400, statusMessage: "Missing signature or body" });
  }
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: `Webhook Error: ${err.message}` });
  }
  switch (stripeEvent.type) {
    case "checkout.session.completed":
      const session = stripeEvent.data.object;
      const planId = (_a = session.metadata) == null ? void 0 : _a.planId;
      const userId = (_b = session.metadata) == null ? void 0 : _b.userId;
      if (userId && planId) {
        console.log(`Success: User ${userId} subscribed to ${planId}`);
      }
      break;
  }
  return { received: true };
});

export { stripeWebhook_post as default };
//# sourceMappingURL=stripe-webhook.post.mjs.map
