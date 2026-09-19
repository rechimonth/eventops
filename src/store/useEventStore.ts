import { create } from 'zustand';

export type UIMode = 'zen' | 'mission' | 'kiosk';
export type Role = 'organizador' | 'pareja' | 'proveedor' | 'vip' | 'invitado';

interface EventState {
  eventId: string | null;
  mode: UIMode;
  role: Role;
  guestCount: number;
  setMode: (m: UIMode) => void;
  setRole: (r: Role) => void;
  setGuestCount: (n: number) => void;
  // Auto-switch: últimas 3 semanas => mission
  autoMode: (eventDateISO: string) => void;
  // Info Diet: oculta presupuesto/timeline interno
  canSeeBudget: () => boolean;
  canSeeInternalTimeline: () => boolean;
}

export const useEventStore = create<EventState>((set, get) => ({
  eventId: null,
  mode: 'zen',
  role: 'organizador',
  guestCount: 0,
  setMode: (mode) => set({ mode }),
  setRole: (role) => set({ role }),
  setGuestCount: (guestCount) => set({ guestCount }),
  autoMode: (eventDateISO) => {
    const diffMs = new Date(eventDateISO).getTime() - Date.now();
    const threeWeeks = 21 * 24 * 3600 * 1000;
    if (diffMs <= threeWeeks) set({ mode: 'mission' });
    else set({ mode: 'zen' });
  },
  canSeeBudget: () => ['organizador', 'pareja'].includes(get().role),
  canSeeInternalTimeline: () => ['organizador', 'pareja', 'proveedor'].includes(get().role),
}));
