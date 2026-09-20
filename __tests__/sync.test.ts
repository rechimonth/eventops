import { resolveConflict } from '../src/db/sync';

test('empate contra tombstone: gana el borrado (no resucita)', () => {
  expect(resolveConflict({ id: 'a', last_write_at: 5 }, { id: 'a', last_write_at: 5, deleted: true })).toBe('remote');
  expect(resolveConflict({ id: 'a', last_write_at: 5, deleted: true }, { id: 'a', last_write_at: 5 })).toBe('local');
});

test('distinto timestamp: gana el mayor', () => {
  expect(resolveConflict({ id: 'a', last_write_at: 6 }, { id: 'a', last_write_at: 5, deleted: true })).toBe('local');
  expect(resolveConflict({ id: 'a', last_write_at: 4 }, { id: 'a', last_write_at: 5 })).toBe('remote');
});
