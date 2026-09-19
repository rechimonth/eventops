import React, { createContext, useContext, useMemo, useState } from 'react';
import { MOCK_GUESTS, MOCK_PROVIDERS, MOCK_GANTT, MOCK_BUDGET, MockGuest, MockProvider } from './mockData';
import type { TNode } from '../logistics/gantt';

// FASE 8: MockProvider — inyección de dependencias.
// Si EXPO_PUBLIC_USE_MOCKS === 'true', las pantallas leen de aquí y NUNCA
// tocan Supabase: SeatingPlanV2 y Mission Control renderizan sin crashear.

interface MockDB {
  guests: MockGuest[];
  providers: MockProvider[];
  gantt: TNode[];
  budget: typeof MOCK_BUDGET;
  assignTable: (guestId: string, tableId: string) => void;
  confirmRsvp: (guestId: string) => void;
  advanceProvider: (providerId: string) => void;
}

const Ctx = createContext<MockDB | null>(null);

const FLOW = ['pending', 'confirmed', 'in_transit', 'at_door', 'load_in', 'live', 'load_out', 'done'];

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [guests, setGuests] = useState<MockGuest[]>(MOCK_GUESTS);
  const [providers, setProviders] = useState<MockProvider[]>(MOCK_PROVIDERS);

  const value = useMemo<MockDB>(() => ({
    guests,
    providers,
    gantt: MOCK_GANTT,
    budget: MOCK_BUDGET,
    assignTable: (guestId, tableId) =>
      setGuests((gs) => gs.map((g) => (g.id === guestId ? { ...g, tableId } : g))),
    confirmRsvp: (guestId) =>
      setGuests((gs) => gs.map((g) => (g.id === guestId ? { ...g, rsvp_status: 'confirmed' } : g))),
    advanceProvider: (providerId) =>
      setProviders((ps) => ps.map((p) => {
        if (p.id !== providerId) return p;
        const next = FLOW[Math.min(FLOW.indexOf(p.status) + 1, FLOW.length - 1)];
        return { ...p, status: next };
      })),
  }), [guests, providers]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMockDB(): MockDB {
  const db = useContext(Ctx);
  if (!db) throw new Error('useMockDB debe usarse dentro de <MockProvider>');
  return db;
}
