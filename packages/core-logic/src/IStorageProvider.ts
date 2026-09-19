// packages/core-logic/src/IStorageProvider.ts
// FASE 13: contrato de storage agnóstico de plataforma.
// El Dashboard y el syncEngine solo hablan con esta interfaz:
// en Android se resuelve con WatermelonDB/SQLite, en desktop Tauri
// con SQLite vía Rust (plugin-sql) o archivos nativos. Cero imports
// de plataforma en la lógica de negocio.

export interface GuestRow {
  id: string; eventId: string; fullName: string;
  rsvp: 'pending' | 'confirmed' | 'declined';
  dietary?: string; tableId?: string;
  updatedAt: number; isDeleted: boolean;
}

export interface ProviderRow {
  id: string; eventId: string; category: string; name: string;
  status: string; qrToken: string;
  updatedAt: number; isDeleted: boolean;
}

export interface SyncSlice<T> { updated: T[]; deletedIds: string[]; }

export interface IStorageProvider {
  readonly platform: 'android' | 'windows' | 'macos' | 'web';

  // Lectura local (offline-first: nunca toca la red)
  listGuests(eventId: string): Promise<GuestRow[]>;
  listProviders(eventId: string): Promise<ProviderRow[]>;

  // Escritura local (soft delete: jamás borra físicamente)
  upsertGuest(row: GuestRow): Promise<void>;
  softDeleteGuest(id: string, updatedAt: number): Promise<void>;
  upsertProvider(row: ProviderRow): Promise<void>;

  // Delta para pushChanges: lo modificado desde `since`
  dirtySince(since: number): Promise<{ guests: GuestRow[]; providers: ProviderRow[] }>;
  markClean(ids: string[]): Promise<void>;

  // Pull: aplica el delta que baja de Supabase (LWW ya resuelto arriba)
  applyPull(slice: { guests: SyncSlice<GuestRow>; providers: SyncSlice<ProviderRow> }): Promise<void>;
}

// --- Dashboard desacoplado: funciona igual en Expo y en Tauri ---
export async function loadMissionControl(db: IStorageProvider, eventId: string) {
  const [guests, providers] = await Promise.all([db.listGuests(eventId), db.listProviders(eventId)]);
  const pending = guests.filter((g) => g.rsvp === 'pending' && !g.isDeleted).length;
  const inVenue = providers.filter((p) => ['at_door', 'load_in', 'live'].includes(p.status)).length;
  return { guests: guests.filter((g) => !g.isDeleted), providers, pending, inVenue };
}

// --- Adaptadores (cada app registra el suyo al arrancar) ---
// Android/Expo: WatermelonDB → collections .query(Q.where('event_id', id))
//   listGuests = db.get('guests').query(Q.where('event_id', eventId)).fetch()
//   softDeleteGuest = record.update(r => { r.isDeleted = true; r.updatedAt = now })
// Desktop/Tauri: @tauri-apps/plugin-sql → `SELECT * FROM guests WHERE event_id = ?`
//   listGuests = await Database.load('sqlite:eventops.db').then(d => d.select(...))
//   softDeleteGuest = execute('UPDATE guests SET is_deleted=1, updated_at=? WHERE id=?')
// Web/preview: mismo contrato sobre localStorage (útil para el Kiosk de invitados).
