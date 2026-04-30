import { createHmac, timingSafeEqual } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';

import { getFirebaseAdminDb } from '../utils/firebase-admin';
import { ensureServerEnvLoaded } from '../utils/load-env';

ensureServerEnvLoaded();

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const PADDLE_PRICE_STARTER = process.env.PADDLE_PRICE_STARTER;
const PADDLE_PRICE_PRO = process.env.PADDLE_PRICE_PRO;

type SupportedPlan = 'starter' | 'pro';

const PLAN_BY_PRICE_ID: Record<string, SupportedPlan> = Object.fromEntries(
  [
    [PADDLE_PRICE_STARTER, 'starter'],
    [PADDLE_PRICE_PRO, 'pro']
  ].filter(([priceId]) => Boolean(priceId))
) as Record<string, SupportedPlan>;

function parsePaddleSignature(signatureHeader: string) {
  const parts = signatureHeader
    .split(';')
    .map((part) => part.trim())
    .map((part) => {
      const [key, ...rest] = part.split('=');
      return [key, rest.join('=')] as const;
    });

  const timestamp = parts.find(([key]) => key === 'ts')?.[1];
  const signatures = parts.filter(([key]) => key === 'h1').map(([, value]) => value);

  return { timestamp, signatures };
}

function safeCompareHex(expectedHex: string, receivedHex: string) {
  try {
    const expected = Buffer.from(expectedHex, 'hex');
    const received = Buffer.from(receivedHex, 'hex');
    if (expected.length !== received.length) return false;
    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

function verifyPaddleSignature(rawBody: string, signatureHeader: string, secret: string) {
  const { timestamp, signatures } = parsePaddleSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const unixTs = Number(timestamp);
  if (!Number.isFinite(unixTs)) return false;

  // Replay protection (5 minutes tolerance).
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - unixTs) > 5 * 60) return false;

  const signedPayload = `${timestamp}:${rawBody}`;
  const expectedSignature = createHmac('sha256', secret).update(signedPayload).digest('hex');

  return signatures.some((signature) => safeCompareHex(expectedSignature, signature));
}

function normalizePlan(planId: unknown): SupportedPlan | null {
  if (planId === 'starter' || planId === 'pro') return planId;
  return null;
}

function inferPlanFromItems(items: any): SupportedPlan | null {
  if (!Array.isArray(items)) return null;

  for (const item of items) {
    const priceId = item?.price?.id;
    if (typeof priceId === 'string' && PLAN_BY_PRICE_ID[priceId]) {
      return PLAN_BY_PRICE_ID[priceId];
    }
  }

  return null;
}

async function resolveUserIdByEmail(email: string) {
  const db = getFirebaseAdminDb();
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}

export default defineEventHandler(async (event) => {
  if (!PADDLE_WEBHOOK_SECRET) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing PADDLE_WEBHOOK_SECRET in server environment'
    });
  }

  const signatureHeader = getHeader(event, 'paddle-signature');
  const rawBody = await readRawBody(event, 'utf8');

  if (!signatureHeader || !rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Paddle-Signature header or request body'
    });
  }

  const isVerified = verifyPaddleSignature(rawBody, signatureHeader, PADDLE_WEBHOOK_SECRET);
  if (!isVerified) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Paddle webhook signature'
    });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid JSON payload'
    });
  }

  const eventType = payload?.event_type as string | undefined;
  const data = payload?.data || {};
  const transactionStatus = String(data?.status || '').toLowerCase();

  const shouldHandleTransactionEvent =
    eventType === 'transaction.completed' ||
    eventType === 'transaction.paid' ||
    (eventType === 'transaction.updated' &&
      (transactionStatus === 'completed' || transactionStatus === 'paid'));

  if (!shouldHandleTransactionEvent) {
    return { received: true, ignored: true, eventType };
  }

  const customData = data?.custom_data || {};

  const planId = normalizePlan(customData?.planId) || inferPlanFromItems(data?.items);
  if (!planId) {
    return {
      received: true,
      ignored: true,
      reason: 'plan_not_found'
    };
  }

  const userIdFromPayload =
    typeof customData?.userId === 'string' ? customData.userId.trim() : '';
  const emailFromPayload =
    typeof customData?.email === 'string' ? customData.email.trim().toLowerCase() : '';

  const targetUserId =
    userIdFromPayload || (emailFromPayload ? await resolveUserIdByEmail(emailFromPayload) : null);

  if (!targetUserId) {
    return {
      received: true,
      ignored: true,
      reason: 'user_not_found'
    };
  }

  const db = getFirebaseAdminDb();

  await db
    .collection('users')
    .doc(targetUserId)
    .set(
      {
        uid: targetUserId,
        ...(emailFromPayload ? { email: emailFromPayload } : {}),
        plan: planId,
        usage: 0,
        updatedAt: FieldValue.serverTimestamp(),
        billingProvider: 'paddle',
        paddleLastEventId: payload?.event_id || null,
        paddleLastEventType: eventType,
        paddleLastTransactionId: data?.id || null,
        paddleSubscriptionId: data?.subscription_id || null
      },
      { merge: true }
    );

  return { received: true };
});
