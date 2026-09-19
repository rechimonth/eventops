import { isMockMode } from './env';
import { MOCK_GUESTS, MOCK_PROVIDERS, MOCK_GANTT } from '../mocks/mockData';
import { supabase } from './supabase';

// FASE 8: cliente de datos con bypass.
// Mock => memoria local. Real => Supabase. La UI nunca crashea sin red.
export async function fetchGuests(eventId: string) {
  if (isMockMode()) return { data: MOCK_GUESTS, source: 'mock' as const };
  const { data, error } = await supabase.from('guests').select('*').eq('event_id', eventId);
  if (error) throw error;
  return { data, source: 'supabase' as const };
}

export async function fetchProviders(eventId: string) {
  if (isMockMode()) return { data: MOCK_PROVIDERS, source: 'mock' as const };
  const { data, error } = await supabase.from('providers').select('*').eq('event_id', eventId);
  if (error) throw error;
  return { data, source: 'supabase' as const };
}

export async function fetchTimeline(eventId: string) {
  if (isMockMode()) return { data: MOCK_GANTT, source: 'mock' as const };
  const { data, error } = await supabase.from('timeline_nodes').select('*').eq('event_id', eventId);
  if (error) throw error;
  return { data, source: 'supabase' as const };
}
