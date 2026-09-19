import React from 'react';
import { View, Text } from 'react-native';
import { sumBudget } from '../logistics/budget';
import { useEventStore } from '../store/useEventStore';

// Shadow Budget Board: oculta a roles no autorizados (Info Diet).
export function BudgetBoard({ items }: { items: { amount: number; taxRate?: number; concept: string }[] }) {
  const canSee = useEventStore((s) => s.canSeeBudget());
  if (!canSee) return <Text>Presupuesto restringido (Info Diet).</Text>;
  const t = sumBudget(items);
  return (
    <View style={{ padding: 12, backgroundColor: '#151B26', borderRadius: 8 }}>
      <Text style={{ color: '#E6EDF3', fontFamily: 'monospace' }}>Base ${t.base} + IVA ${t.tax.toFixed(0)} + Shadow20% ${t.shadow.toFixed(0)}</Text>
      <Text style={{ color: '#7CFFB2', fontFamily: 'monospace', fontWeight: '700' }}>TOTAL REAL ${t.total.toFixed(0)}</Text>
    </View>
  );
}
