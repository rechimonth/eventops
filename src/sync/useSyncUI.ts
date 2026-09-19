import { create } from 'zustand';

// FASE 9: semáforo global de red para la UI.
// 🟢 Sincronizado | 🟡 Guardado Local (offline) | 🔴 Error de Sync
export type SyncState = 'ok' | 'offline' | 'error' | 'syncing';

interface SyncUI { state: SyncState; pending: number; set: (s: Partial<SyncUI>) => void; }

export const useSyncUI = create<SyncUI>((set) => ({
  state: 'offline',
  pending: 0,
  set: (s) => set(s),
}));

export const SEMAPHORE: Record<SyncState, { dot: string; label: string }> = {
  ok: { dot: '🟢', label: 'Sincronizado' },
  offline: { dot: '🟡', label: 'Guardado Local (Offline)' },
  error: { dot: '🔴', label: 'Error de Sync' },
  syncing: { dot: '🔵', label: 'Sincronizando…' },
};
