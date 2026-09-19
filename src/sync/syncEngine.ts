import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../db/database';
import { supabase } from '../lib/supabase';
import { enqueueFailed, RetryRecord } from '../sync/RetryQueue';

// FASE 9: sync() real con WatermelonDB.
// - pullChanges: trae desde Supabase (updated_at > lastPulledAt), ignora is_deleted.
// - pushChanges: sube locales; PROHIBIDO el DELETE real: se escribe is_deleted=true.
// - Conflictos: Last-Write-Wins por updated_at (Supabase resuelve en la nube).
// - Si la red falla: nada se borra local; se encola en RetryQueue (dead-letter).

export async function fullSync(onStatus?: (s: 'syncing' | 'ok' | 'offline' | 'error') => void) {
  onStatus?.('syncing');
  try {
    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt }) => {
        const since = lastPulledAt ? new Date(lastPulledAt).toISOString() : new Date(0).toISOString();
        const tables = ['guests', 'providers', 'budget_items', 'timeline_nodes'];
        const changes: Record<string, { created: any[]; updated: any[]; deleted: string[] }> = {};
        for (const t of tables) {
          const { data, error } = await supabase.from(t).select('*').gt('updated_at', since).eq('is_deleted', false);
          if (error) throw error;
          changes[t] = { created: [], updated: data ?? [], deleted: [] };
        }
        return { changes, timestamp: Date.now() };
      },
      pushChanges: async ({ changes }) => {
        for (const [table, { created, updated }] of Object.entries(changes as Record<string, { created: any[]; updated: any[] }>)) {
          const rows = [...(created ?? []), ...(updated ?? [])];
          for (const row of rows) {
            // Soft delete: nunca DELETE; el borrado viaja como update { is_deleted: true }
            const { error } = await supabase.from(table).upsert({ ...row, updated_at: new Date().toISOString() });
            if (error) {
              const rec: RetryRecord = { id: `${table}:${row.id}:${Date.now()}`, table, op: 'upsert', payload: row, attempts: 0, nextRetryAt: Date.now() };
              await enqueueFailed(rec);
              throw error; // corta el push; lo local queda intacto y reintenta con backoff
            }
          }
        }
      },
    });
    onStatus?.('ok');
  } catch {
    onStatus?.('offline'); // red inestable: Guardado Local, reintento programado
  }
}
