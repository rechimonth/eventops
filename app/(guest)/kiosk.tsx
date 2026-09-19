import { View, Text } from 'react-native';
// Kiosk invitados: solo lectura (mesa, dieta, countdown, fotos). Sin presupuesto ni timeline interno.
export default function Kiosk() {
  return <View style={{ flex: 1, padding: 16 }}><Text>Guest Kiosk — mesa, dress code, mapa, RSVP, álbum</Text></View>;
}
