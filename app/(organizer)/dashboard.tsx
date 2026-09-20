import React from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { useEventStore } from '../../src/store/useEventStore';
import { isMockMode } from '../../src/lib/env';
import { MockProvider, useMockDB } from '../../src/mocks/MockProvider';
import { GanttChart } from '../../src/components/GanttChart';
import { BudgetBoard } from '../../src/components/BudgetBoard';
import { SyncSemaphore } from '../../src/sync/SyncSemaphore';

// Mission Control: Gantt + QR/despacho + Shadow Budget + semáforo.
// Mock: opera 100% local. Live: mismo layout contra Supabase (vía dataClient).
function DashboardMock() {
  const mode = useEventStore((s) => s.mode);
  const { guests, providers, gantt, budget, advanceProvider } = useMockDB();
  const pending = guests.filter((g) => g.rsvp_status === 'pending').length;
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontFamily: 'monospace', fontWeight: '700' }}>
        MISSION CONTROL ({mode}) {isMockMode() ? '[DEMO LOCAL]' : ''}
      </Text>
      <SyncSemaphore />
      <Text style={{ fontFamily: 'monospace' }}>RSVP pendientes: {pending}/{guests.length}</Text>
      <Text style={{ fontFamily: 'monospace', fontWeight: '700', marginTop: 12 }}>GANTT — demo: maquillaje +30min</Text>
      <GanttChart nodes={gantt} delayedId="makeup" delayMin={30} />
      <Text style={{ fontFamily: 'monospace', fontWeight: '700', marginTop: 12 }}>PROVEEDORES (despacho)</Text>
      {providers.map((p) => (
        <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'monospace' }}>{p.name} · {p.status} · {p.qr_token}</Text>
          <Button title="›" onPress={() => advanceProvider(p.id)} />
        </View>
      ))}
      <Text style={{ fontFamily: 'monospace', fontWeight: '700', marginTop: 12 }}>PRESUPUESTO</Text>
      <BudgetBoard items={budget} />
    </ScrollView>
  );
}

export default function Dashboard() {
  if (!isMockMode()) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <SyncSemaphore />
        <Text>Conecta Supabase (ver .env.example) para el modo live.</Text>
      </View>
    );
  }
  return (
    <MockProvider>
      <DashboardMock />
    </MockProvider>
  );
}
