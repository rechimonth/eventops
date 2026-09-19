import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { recalculateTimeline, TNode } from '../logistics/gantt';

// Gantt interactivo SSOT: arrastra Maquillaje 30min => recalcula y marca colisiones en rojo.
export function GanttChart({ nodes, delayedId, delayMin }: { nodes: TNode[]; delayedId?: string; delayMin?: number }) {
  const { nodes: out, collisions } = useMemo(
    () => (delayedId ? recalculateTimeline(nodes, delayedId, delayMin ?? 0) : { nodes, collisions: [] }),
    [nodes, delayedId, delayMin]
  );
  const bad = new Set(collisions.map((c) => c.nodeId));
  return (
    <ScrollView horizontal>
      <View style={{ padding: 12 }}>
        {out.map((n) => (
          <View key={n.id} style={{ backgroundColor: bad.has(n.id) ? '#3A0D0D' : '#151B26', marginBottom: 6, padding: 8, borderRadius: 6, minWidth: 280 }}>
            <Text style={{ color: bad.has(n.id) ? '#FF6B6B' : '#E6EDF3', fontFamily: 'monospace' }}>
              {n.title} {new Date(n.startsAt).toISOString().slice(11, 16)}→{new Date(n.endsAt).toISOString().slice(11, 16)}
              {bad.has(n.id) ? '  ⚠ COLISIÓN' : ''}
            </Text>
          </View>
        ))}
        {delayedId ? <Text style={{ color: '#FFB020', fontFamily: 'monospace' }}>SMS→fotógrafo: maquillaje +{delayMin}min, fotos recalculadas.</Text> : null}
      </View>
    </ScrollView>
  );
}
