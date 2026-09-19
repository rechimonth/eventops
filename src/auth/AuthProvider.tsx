import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';

// Auth Flow protegido: Login -> Dashboard (organizador) vs Guest -> Kiosk.
// Sin dependencias circulares: el guard vive solo aquí.
const Ctx = createContext<{ session: any; role: string }>({ session: null, role: 'invitado' });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const segments = useSegments() as string[];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    const inGuest = segments[0] === '(guest)';
    if (!session && !inAuth && !inGuest) router.replace('/(auth)/login' as any);
    if (session && inAuth) router.replace('/(organizer)/dashboard' as any);
  }, [session, segments]);

  return <Ctx.Provider value={{ session, role: session ? 'organizador' : 'invitado' }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
