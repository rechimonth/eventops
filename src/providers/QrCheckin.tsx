import React from 'react';
import { View, Text, Button } from 'react-native';
import { supabase } from '../lib/supabase';

// Gestor de Accesos: cada proveedor tiene qr_token. Al escanear => check-in en vivo.
// Estados despacho: pending→confirmed→in_transit→at_door→load_in→live→load_out→done
const FLOW = ['pending', 'confirmed', 'in_transit', 'at_door', 'load_in', 'live', 'load_out', 'done'] as const;

export function QrCheckin({ qrToken }: { qrToken: string }) {
  const advance = async () => {
    const { data } = await supabase.from('providers').select('*').eq('qr_token', qrToken).single();
    if (!data) return;
    const next = FLOW[Math.min(FLOW.indexOf(data.status) + 1, FLOW.length - 1)];
    await supabase.from('providers').update({ status: next }).eq('id', data.id);
  };
  return (
    <View style={{ padding: 12 }}>
      <Text>QR Proveedor: {qrToken}</Text>
      <Button title="Check-in / avanzar estado" onPress={advance} />
    </View>
  );
}
