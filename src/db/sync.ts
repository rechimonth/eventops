// Sync offline-first: WatermelonDB <-> Supabase.
// Estrategia de conflictos: Last-Write-Wins por last_write_at + last_writer.
// Caso: A elimina offline, B edita online => gana el timestamp mayor; el delete
// se modela como tombstone con last_write_at para no resucitar filas.

export interface SyncRecord { id: string; last_write_at: number; last_writer?: string; deleted?: boolean }

export function resolveConflict(local: SyncRecord, remote: SyncRecord): 'local' | 'remote' {
  if (local.last_write_at !== remote.last_write_at) {
    return local.last_write_at > remote.last_write_at ? 'local' : 'remote';
  }
  // Empate: si hay un tombstone, gana el borrado (la fila no resucita).
  if (local.deleted && !remote.deleted) return 'local';
  if (remote.deleted && !local.deleted) return 'remote';
  return 'local';
}

export async function pushPull(supabase: any, table: string, localRows: SyncRecord[]) {
  // Pull: trae cambios desde updated_at / last_write_at
  const { data: remoteRows } = await supabase.from(table).select('*');
  // Push: en producción, batch upsert solo con winner local
  const toPush = localRows.filter((l) => {
    const r = (remoteRows ?? []).find((x: any) => x.id === l.id);
    if (!r) return true;
    return resolveConflict(l, { ...r, last_write_at: new Date(r.last_write_at ?? r.updated_at).getTime() }) === 'local';
  });
  return { pulled: (remoteRows ?? []).length, pushed: toPush.length };
}
