import { View, Text } from 'react-native';
import { useEventStore } from '../../src/store/useEventStore';
// Mission Control: estados despacho industrial: in_transit → at_door → load_in → live → load_out → done
export default function Dashboard() {
  const mode = useEventStore((s) => s.mode);
  return <View style={{ flex: 1, padding: 16 }}><Text>Mission Control ({mode}) — Gantt + QR check-in + Shadow Budget</Text></View>;
}
