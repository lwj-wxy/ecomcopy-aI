import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { ensureServerEnvLoaded } from './load-env';
import firebaseAppletConfig from '../../firebase-applet-config.json';

ensureServerEnvLoaded();

let adminDb: Firestore | null = null;

function normalizePrivateKey(value: unknown) {
  if (!value) return undefined;

  let normalized = String(value).trim();

  // Tolerate copy/paste from JSON or .env values that accidentally keep a trailing comma.
  if (normalized.endsWith(',')) {
    normalized = normalized.slice(0, -1).trimEnd();
  }

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  return normalized.replace(/\\n/g, '\n');
}

function getServiceAccountFromEnv() {
  const rawJson =
    process.env.FIREBASE_ADMIN_CREDENTIALS_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawJson) return null;

  const parsed = JSON.parse(rawJson);
  if (parsed?.private_key) {
    parsed.private_key = normalizePrivateKey(parsed.private_key);
  }

  return {
    projectId: parsed.project_id || parsed.projectId,
    clientEmail: parsed.client_email || parsed.clientEmail,
    privateKey: parsed.private_key || parsed.privateKey
  };
}

export function getFirebaseAdminDb() {
  if (adminDb) return adminDb;

  if (!getApps().length) {
    const serviceAccount = getServiceAccountFromEnv();
    const envProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const envClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const envPrivateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

    if (serviceAccount?.projectId && serviceAccount?.clientEmail && serviceAccount?.privateKey) {
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
      // Fallback for environments where ADC/GOOGLE_APPLICATION_CREDENTIALS is configured.
      initializeApp({
        credential: applicationDefault(),
        ...(envProjectId ? { projectId: envProjectId } : {})
      });
    }
  }

  const databaseId =
    process.env.FIREBASE_ADMIN_DATABASE_ID ||
    process.env.FIREBASE_DATABASE_ID ||
    process.env.FIRESTORE_DATABASE_ID ||
    (firebaseAppletConfig as any)?.firestoreDatabaseId;

  const app = getApps()[0];
  adminDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  return adminDb;
}
