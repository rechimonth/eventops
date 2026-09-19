import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';

// Auditoría: quién modificó qué (pareja 1 vs pareja 2 vs planner).
export function AuditList({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('audit_logs').select('*').eq('event_id', eventId).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setRows(data ?? []));
  }, [eventId]);
  return (
    <FlatList data={rows} keyExtractor={(r) => r.id}
      renderItem={({ item }) => <View style={{ padding: 8 }}><Text>{item.created_at} — {item.actor} {item.action} {item.entity}:{item.entity_id}</Text></View>} />
  );
}
