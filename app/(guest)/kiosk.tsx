import React from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { isMockMode } from '../../src/lib/env';
import { MockProvider, useMockDB } from '../../src/mocks/MockProvider';

// Kiosk invitados: solo lectura (mesa, dieta) + botón RSVP.
// Sin presupuesto ni timeline interno (Info Diet).
function KioskMock() {
  const { guests, confirmRsvp } = useMockDB();
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: '700', fontSize: 20 }}>¡Te invitamos! 💒</Text>
      <Text>Mesa · dieta · vestimenta formal · álbum compartido 📸</Text>
      {guests.map((g) => (
        <View key={g.id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text>{g.full_name} {g.tableId ? `· Mesa ${g.tableId}` : '· mesa a asignar'}</Text>
          {g.dietary ? <Text>Dieta: {g.dietary}</Text> : null}
          {g.rsvp_status === 'pending'
            ? <Button title="Confirmar asistencia 🙌" onPress={() => confirmRsvp(g.id)} />
            : <Text>{g.rsvp_status === 'confirmed' ? '✅ Confirmado' : '❌ No viene'}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

export default function Kiosk() {
  if (!isMockMode()) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Kiosk — conecta Supabase para invitados reales.</Text>
      </View>
    );
  }
  return (
    <MockProvider>
      <KioskMock />
    </MockProvider>
  );
}
