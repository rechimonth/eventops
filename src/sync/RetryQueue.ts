import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleNextPure, MAX_ATTEMPTS } from './backoff';

// FASE 9: Dead-letter Queue. Los cambios que fallan NO se pierden:
// se encolan y reintentan con Exponential Backoff cada 3 minutos base.
// backoff: 3min * 2^attempts, tope 24 reintentos (~equivale a días de salón sin Wi-Fi).
export { MAX_ATTEMPTS };

const KEY = '@eventops/retry-queue';

export interface RetryRecord { id: string; table: string; op: 'upsert'; payload: any; attempts: number; nextRetryAt: number }

async function load(): Promise<RetryRecord[]> {
  try { return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]'); }
  catch { return []; }
}
async function save(q: RetryRecord[]) { await AsyncStorage.setItem(KEY, JSON.stringify(q)); }

export async function enqueueFailed(rec: RetryRecord) {
  const q = await load();
  if (!q.find((r) => r.id === rec.id)) q.push(rec);
  await save(q);
  return q.length;
}

export async function dueRecords(now = Date.now()) {
  return (await load()).filter((r) => r.nextRetryAt <= now && r.attempts < MAX_ATTEMPTS);
}

export function scheduleNext(rec: RetryRecord, now = Date.now()): RetryRecord {
  return scheduleNextPure(rec, now);
}

export async function markDone(id: string) { await save((await load()).filter((r) => r.id !== id)); }
export async function markRescheduled(rec: RetryRecord) {
  await save((await load()).map((r) => (r.id === rec.id ? scheduleNext(r) : r)));
}
export async function pendingCount() { return (await load()).length; }
