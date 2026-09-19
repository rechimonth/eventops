// FASE 9: backoff puro (sin dependencias RN) — testeable en CI.
export const BASE_MS = 3 * 60 * 1000; // 3 minutos
export const MAX_ATTEMPTS = 24;

export const nextDelayMs = (attempts: number) =>
  Math.min(BASE_MS * 2 ** attempts, BASE_MS * 2 ** 10);

export interface RetryMeta { attempts: number; nextRetryAt: number }

export function scheduleNextPure<T extends RetryMeta>(rec: T, now = Date.now()): T {
  return { ...rec, attempts: rec.attempts + 1, nextRetryAt: now + nextDelayMs(rec.attempts) };
}
