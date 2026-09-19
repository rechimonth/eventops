import { scheduleNextPure, MAX_ATTEMPTS } from '../src/sync/backoff';

test('backoff base 3min y duplica', () => {
  expect(require('../src/sync/backoff').nextDelayMs(0)).toBe(3 * 60 * 1000);
  expect(require('../src/sync/backoff').nextDelayMs(1)).toBe(6 * 60 * 1000);
});

test('scheduleNextPure avanza intento y programa futuro', () => {
  const now = 1_000_000;
  const out = scheduleNextPure({ attempts: 0, nextRetryAt: 0 }, now);
  expect(out.attempts).toBe(1);
  expect(out.nextRetryAt).toBe(now + 3 * 60 * 1000);
  expect(MAX_ATTEMPTS).toBe(24);
});
