import React, { useEffect } from 'react';
import { Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSyncUI, SEMAPHORE } from './useSyncUI';
import { fullSync } from './syncEngine';
import { dueRecords, markDone, markRescheduled, pendingCount, MAX_ATTEMPTS } from './RetryQueue';
import { supabase } from '../lib/supabase';

// FASE 9: semáforo + NetInfo + drenaje de la dead-letter queue.
// Sin red: todo queda local (🟡). Con red: reintenta vencidos con backoff.
export function SyncSemaphore() {
  const { state, pending, set } = useSyncUI();

  useEffect(() => {
    const unsub = NetInfo.addEventListener(async (net) => {
      if (!net.isConnected) { set({ state: 'offline', pending: await pendingCount() }); return; }
      set({ state: 'syncing' });
      // 1) drena dead-letter vencida
      for (const rec of await dueRecords()) {
        const { error } = await supabase.from(rec.table).upsert({ ...rec.payload, updated_at: new Date().toISOString() });
        if (!error) await markDone(rec.id);
        else if (rec.attempts + 1 >= MAX_ATTEMPTS) await markDone(rec.id); // tope: se archiva, no bloquea
        else await markRescheduled(rec);
      }
      // 2) sync normal WatermelonDB
      await fullSync((s) => set({ state: s === 'ok' ? 'ok' : s === 'offline' ? 'offline' : 'error' }));
      set({ pending: await pendingCount() });
    });
    const timer = setInterval(async () => set({ pending: await pendingCount() }), 3 * 60 * 1000);
    return () => { unsub(); clearInterval(timer); };
  }, []);

  const s = SEMAPHORE[state];
  return <Text>{s.dot} {s.label}{pending > 0 ? ` (${pending} pendientes)` : ''}</Text>;
}
