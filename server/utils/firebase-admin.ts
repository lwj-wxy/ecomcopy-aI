import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | null = null;

function getServiceAccountFromEnv() {
  const rawJson =
    process.env.FIREBASE_ADMIN_CREDENTIALS_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawJson) return null;

  const parsed = JSON.parse(rawJson);
  if (parsed?.private_key) {
    parsed.private_key = String(parsed.private_key).replace(/\\n/g, '\n');
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
    const envPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

  adminDb = getFirestore();
  return adminDb;
}
