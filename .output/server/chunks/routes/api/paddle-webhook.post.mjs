import { c as defineEventHandler, e as createError, j as getHeader, k as readRawBody } from '../../_/nitro.mjs';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { e as ensureServerEnvLoaded } from '../../_/load-env.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'dotenv';

var projectId = "brave-attic-493413-m2";
var appId = "1:203400586323:web:3265b506f6331291e4d2a6";
var apiKey = "AIzaSyAk7t9jTE96IV_z7nRXmUyk8cvPodsNSks";
var authDomain = "brave-attic-493413-m2.firebaseapp.com";
var firestoreDatabaseId = "ai-studio-93153a68-fa83-416a-8586-04cae621e5c9";
var storageBucket = "brave-attic-493413-m2.firebasestorage.app";
var messagingSenderId = "203400586323";
var measurementId = "";
const firebaseAppletConfig = {
	projectId: projectId,
	appId: appId,
	apiKey: apiKey,
	authDomain: authDomain,
	firestoreDatabaseId: firestoreDatabaseId,
	storageBucket: storageBucket,
	messagingSenderId: messagingSenderId,
	measurementId: measurementId
};

ensureServerEnvLoaded();
let adminDb = null;
function normalizePrivateKey(value) {
  if (!value) return void 0;
  let normalized = String(value).trim();
  if (normalized.endsWith(",")) {
    normalized = normalized.slice(0, -1).trimEnd();
  }
  if (normalized.startsWith('"') && normalized.endsWith('"') || normalized.startsWith("'") && normalized.endsWith("'")) {
    normalized = normalized.slice(1, -1);
  }
  return normalized.replace(/\\n/g, "\n");
}
function getServiceAccountFromEnv() {
  const rawJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawJson) return null;
  const parsed = JSON.parse(rawJson);
  if (parsed == null ? void 0 : parsed.private_key) {
    parsed.private_key = normalizePrivateKey(parsed.private_key);
  }
  return {
    projectId: parsed.project_id || parsed.projectId,
    clientEmail: parsed.client_email || parsed.clientEmail,
    privateKey: parsed.private_key || parsed.privateKey
  };
}
function getFirebaseAdminDb() {
  var _a;
  if (adminDb) return adminDb;
  if (!getApps().length) {
    const serviceAccount = getServiceAccountFromEnv();
    const envProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const envClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const envPrivateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
    if ((serviceAccount == null ? void 0 : serviceAccount.projectId) && (serviceAccount == null ? void 0 : serviceAccount.clientEmail) && (serviceAccount == null ? void 0 : serviceAccount.privateKey)) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId
      });
    } else if (envProjectId && envClientEmail && envPrivateKey) {
      initializeApp({
        credential: cert({
          projectId: envProjectId,
          clientEmail: envClientEmail,
          privateKey: envPrivateKey
        }),
        projectId: envProjectId
      });
    } else {
      initializeApp({
        credential: applicationDefault(),
        ...envProjectId ? { projectId: envProjectId } : {}
      });
    }
  }
  const databaseId = process.env.FIREBASE_ADMIN_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID || ((_a = firebaseAppletConfig) == null ? void 0 : _a.firestoreDatabaseId);
  const app = getApps()[0];
  adminDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  return adminDb;
}

ensureServerEnvLoaded();
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const PADDLE_PRICE_STARTER = process.env.PADDLE_PRICE_STARTER;
const PADDLE_PRICE_PRO = process.env.PADDLE_PRICE_PRO;
const PLAN_BY_PRICE_ID = Object.fromEntries(
  [
    [PADDLE_PRICE_STARTER, "starter"],
    [PADDLE_PRICE_PRO, "pro"]
  ].filter(([priceId]) => Boolean(priceId))
);
function parsePaddleSignature(signatureHeader) {
  var _a;
  const parts = signatureHeader.split(";").map((part) => part.trim()).map((part) => {
    const [key, ...rest] = part.split("=");
    return [key, rest.join("=")];
  });
  const timestamp = (_a = parts.find(([key]) => key === "ts")) == null ? void 0 : _a[1];
  const signatures = parts.filter(([key]) => key === "h1").map(([, value]) => value);
  return { timestamp, signatures };
}
function safeCompareHex(expectedHex, receivedHex) {
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const received = Buffer.from(receivedHex, "hex");
    if (expected.length !== received.length) return false;
    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}
function verifyPaddleSignature(rawBody, signatureHeader, secret) {
  const { timestamp, signatures } = parsePaddleSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;
  const unixTs = Number(timestamp);
  if (!Number.isFinite(unixTs)) return false;
  const nowSeconds = Math.floor(Date.now() / 1e3);
  if (Math.abs(nowSeconds - unixTs) > 5 * 60) return false;
  const signedPayload = `${timestamp}:${rawBody}`;
  const expectedSignature = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return signatures.some((signature) => safeCompareHex(expectedSignature, signature));
}
function normalizePlan(planId) {
  if (planId === "starter" || planId === "pro") return planId;
  return null;
}
function inferPlanFromItems(items) {
  var _a;
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    const priceId = (_a = item == null ? void 0 : item.price) == null ? void 0 : _a.id;
    if (typeof priceId === "string" && PLAN_BY_PRICE_ID[priceId]) {
      return PLAN_BY_PRICE_ID[priceId];
    }
  }
  return null;
}
async function resolveUserIdByEmail(email) {
  const db = getFirebaseAdminDb();
  const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}
const paddleWebhook_post = defineEventHandler(async (event) => {
  if (!PADDLE_WEBHOOK_SECRET) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing PADDLE_WEBHOOK_SECRET in server environment"
    });
  }
  const signatureHeader = getHeader(event, "paddle-signature");
  const rawBody = await readRawBody(event, "utf8");
  if (!signatureHeader || !rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing Paddle-Signature header or request body"
    });
  }
  const isVerified = verifyPaddleSignature(rawBody, signatureHeader, PADDLE_WEBHOOK_SECRET);
  if (!isVerified) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid Paddle webhook signature"
    });
  }
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid JSON payload"
    });
  }
  const eventType = payload == null ? void 0 : payload.event_type;
  const data = (payload == null ? void 0 : payload.data) || {};
  const transactionStatus = String((data == null ? void 0 : data.status) || "").toLowerCase();
  const shouldHandleTransactionEvent = eventType === "transaction.completed" || eventType === "transaction.paid" || eventType === "transaction.updated" && (transactionStatus === "completed" || transactionStatus === "paid");
  if (!shouldHandleTransactionEvent) {
    return { received: true, ignored: true, eventType };
  }
  const customData = (data == null ? void 0 : data.custom_data) || {};
  const planId = normalizePlan(customData == null ? void 0 : customData.planId) || inferPlanFromItems(data == null ? void 0 : data.items);
  if (!planId) {
    return {
      received: true,
      ignored: true,
      reason: "plan_not_found"
    };
  }
  const userIdFromPayload = typeof (customData == null ? void 0 : customData.userId) === "string" ? customData.userId.trim() : "";
  const emailFromPayload = typeof (customData == null ? void 0 : customData.email) === "string" ? customData.email.trim().toLowerCase() : "";
  const targetUserId = userIdFromPayload || (emailFromPayload ? await resolveUserIdByEmail(emailFromPayload) : null);
  if (!targetUserId) {
    return {
      received: true,
      ignored: true,
      reason: "user_not_found"
    };
  }
  const db = getFirebaseAdminDb();
  await db.collection("users").doc(targetUserId).set(
    {
      uid: targetUserId,
      ...emailFromPayload ? { email: emailFromPayload } : {},
      plan: planId,
      usage: 0,
      updatedAt: FieldValue.serverTimestamp(),
      billingProvider: "paddle",
      paddleLastEventId: (payload == null ? void 0 : payload.event_id) || null,
      paddleLastEventType: eventType,
      paddleLastTransactionId: (data == null ? void 0 : data.id) || null,
      paddleSubscriptionId: (data == null ? void 0 : data.subscription_id) || null
    },
    { merge: true }
  );
  return { received: true };
});

export { paddleWebhook_post as default };
//# sourceMappingURL=paddle-webhook.post.mjs.map
