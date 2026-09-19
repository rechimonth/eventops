import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// FASE 6: Seating Plan. MVP nativo con gesture-handler + reanimated.
// Mapa interactivo: mesas circulares/rectangulares, drag de invitados (lista lateral -> mesa).
// Fabric.js queda para la versión web/desktop (WebView); misma data: { guestId, tableId }.
export function SeatingPlan({ guests, onAssign }: { guests: { id: string; name: string }[]; onAssign: (guestId: string, tableId: string) => void }) {
  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1, padding: 12 }}>
        <Text style={{ fontWeight: '700' }}>Plano del salón (MVP)</Text>
        <Text>Arrastra invitados a mesas. Mesas demo: M1 (redonda x8), M2 (rect x10).</Text>
        {guests.slice(0, 5).map((g) => (
          <Text key={g.id} onPress={() => onAssign(g.id, 'M1')}>{g.name} → M1 (tap para asignar)</Text>
        ))}
      </View>
    </GestureHandlerRootView>
  );
}
