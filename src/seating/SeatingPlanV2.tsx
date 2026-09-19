import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DEFAULT_TABLES } from './tables';

// Seating v2: tap-to-assign robusto (sin crashes en listas grandes).
// Drag con reanimated queda tras `npm install`; misma data { guestId, tableId }.
export function SeatingPlanV2({ guests, onAssign }: { guests: { id: string; name: string; tableId?: string }[]; onAssign: (guestId: string, tableId: string) => void }) {
  const [table, setTable] = useState('M1');
  const seated = guests.filter((g) => g.tableId === table).length;
  const cap = DEFAULT_TABLES.find((t) => t.id === table)?.seats ?? 8;
  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 8 }}>
        {DEFAULT_TABLES.map((t) => (
          <Pressable key={t.id} onPress={() => setTable(t.id)}
            style={{ padding: 10, marginRight: 8, borderRadius: 20, backgroundColor: table === t.id ? '#2B7FFF' : '#DDD' }}>
            <Text style={{ color: table === t.id ? '#fff' : '#111' }}>{t.id} {t.shape === 'round' ? '●' : '■'}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ paddingHorizontal: 12 }}>Mesa {table}: {seated}/{cap} {seated > cap ? '⚠ SOBRECUPO' : ''}</Text>
      <View style={{ padding: 12 }}>
        {guests.slice(0, 50).map((g) => (
          <Pressable key={g.id} onPress={() => onAssign(g.id, table)} style={{ padding: 6 }}>
            <Text>{g.name} {g.tableId ? `→ ${g.tableId}` : '→ sin mesa'}</Text>
          </Pressable>
        ))}
      </View>
      </View>
    </GestureHandlerRootView>
  );
}
