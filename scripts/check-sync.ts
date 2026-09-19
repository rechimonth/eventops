import { resolveConflict } from '../src/db/sync';
const local = { id: 'g1', last_write_at: 200, deleted: true };
const remote = { id: 'g1', last_write_at: 100 };
console.log('winner (esperado local/delete):', resolveConflict(local, remote));
const l2 = { id: 'g1', last_write_at: 50 };
const r2 = { id: 'g1', last_write_at: 99 };
console.log('winner (esperado remote):', resolveConflict(l2, r2));
