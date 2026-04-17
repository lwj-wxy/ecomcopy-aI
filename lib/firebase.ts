import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// 标准初始化，不再强制长轮询，避免在新标签页下产生过多的 channel 请求
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  // 如果是权限错误，我们只记录一次日志，不再抛出异常，防止一些组件进入重试死循环
  if (error?.code === 'permission-denied') {
    console.warn(`[Firestore Safe Guard] Permission denied for ${operationType} on ${path}. Operation ignored to prevent infinite retries.`);
    return;
  }
  
  console.error(`Firestore Error [${operationType}] on ${path}:`, error);
}
