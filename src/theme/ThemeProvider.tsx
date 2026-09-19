import React, { createContext, useContext } from 'react';
import { useEventStore } from '../store/useEventStore';

// FASE 2: Motor de temas dinámicos. Zen = pastel/serif, Mission = industrial/mono denso.
export type Theme = {
  bg: string; card: string; text: string; accent: string;
  font: string; density: 'comfortable' | 'compact';
};

export const themes: Record<'zen' | 'mission' | 'kiosk', Theme> = {
  zen: {
    bg: '#FFF9F5', card: '#FFFFFF', text: '#3D2C2C', accent: '#E8B4B8',
    font: 'PlayfairDisplay', density: 'comfortable' as const,
  },
  mission: {
    bg: '#0B0E14', card: '#151B26', text: '#E6EDF3', accent: '#FF4D4D',
    font: 'JetBrainsMono', density: 'compact' as const,
  },
  kiosk: {
    bg: '#FFFFFF', card: '#F6F6F6', text: '#111111', accent: '#2B7FFF',
    font: 'System', density: 'comfortable' as const,
  },
};

const ThemeCtx = createContext<Theme>(themes.zen);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useEventStore((s) => s.mode);
  return <ThemeCtx.Provider value={themes[mode]}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
