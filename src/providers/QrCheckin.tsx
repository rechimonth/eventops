import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { supabase } from '../lib/supabase';

// Gestor de Accesos: cada proveedor tiene qr_token. Al escanear => check-in en vivo.
// Estados despacho: pending→confirmed→in_transit→at_door→load_in→live→load_out→done
// late/cancelled son terminales fuera del flujo: no se avanza ni se resetea a pending.
const FLOW = ['pending', 'confirmed', 'in_transit', 'at_door', 'load_in', 'live', 'load_out', 'done'] as const;

export function QrCheckin({ qrToken }: { qrToken: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const advance = async () => {
    if (busy) return; // anti doble-toque
    setBusy(true);
    setErr('');
    try {
      const { data, error } = await supabase.from('providers').select('*').eq('qr_token', qrToken).single();
      if (error) throw error;
      if (!data) return;
      const idx = (FLOW as readonly string[]).indexOf(data.status);
      if (idx < 0) {
        setErr(`Estado '${data.status}' fuera de flujo (late/cancelled): requiere acción manual.`);
        return;
      }
      if (idx === FLOW.length - 1) return; // done: terminal
      const { error: upErr } = await supabase.from('providers').update({ status: FLOW[idx + 1] }).eq('id', data.id);
      if (upErr) throw upErr;
    } catch (e: any) {
      setErr(e?.message ?? 'Error de red: el check-in queda pendiente.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ padding: 12 }}>
      <Text>QR Proveedor: {qrToken}</Text>
      <Button title="Check-in / avanzar estado" onPress={advance} />
      {err ? <Text style={{ color: 'red' }}>{err}</Text> : null}
    </View>
  );
}
