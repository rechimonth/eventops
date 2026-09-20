// FASE 9: backoff puro (sin dependencias RN) — testeable en CI.
// 3 min base, tope 30 min, 16 intentos (~8h de cobertura: un evento, no un mes).
export const BASE_MS = 3 * 60 * 1000; // 3 minutos
export const MAX_DELAY_MS = 30 * 60 * 1000; // tope: el salón no espera días
export const MAX_ATTEMPTS = 16;

export const nextDelayMs = (attempts: number) =>
  Math.min(BASE_MS * 2 ** attempts, MAX_DELAY_MS);

export interface RetryMeta { attempts: number; nextRetryAt: number }

export function scheduleNextPure<T extends RetryMeta>(rec: T, now = Date.now()): T {
  return { ...rec, attempts: rec.attempts + 1, nextRetryAt: now + nextDelayMs(rec.attempts) };
}
