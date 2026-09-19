import * as Contacts from 'expo-contacts';
import { Linking } from 'react-native';

// FASE 3: lector de contactos + distribución multicanal.
// Envuelve expo-contacts con manejo de listas grandes (paginado) para evitar crashes.

export async function pickGuests(search = '') {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('Permiso de contactos denegado');
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    pageSize: 200,
    pageOffset: 0,
  });
  return data
    .filter((c) => (c.name ?? '').toLowerCase().includes(search.toLowerCase()))
    .slice(0, 500)
    .map((c) => ({ name: c.name, phone: c.phoneNumbers?.[0]?.number }));
}

export function inviteMessage(name: string, url: string) {
  return `Hola ${name}, te invito a mi boda. Confirma aquí: ${url}`;
}

export function openWhatsApp(phone: string, text: string) {
  return Linking.openURL(`whatsapp://send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`);
}

export function openTelegram(phone: string, text: string) {
  return Linking.openURL(`tg://msg?to=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`);
}

export function inviteSlug(fullName: string) {
  return fullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
}
