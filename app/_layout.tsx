import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { AuthProvider } from '../src/auth/AuthProvider';
import { SyncSemaphore } from '../src/sync/SyncSemaphore';
import * as Sentry from 'sentry-expo';

Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, enableInExpoDevelopment: false });

export default function Layout() {
  return (
    <AuthProvider>
    <ThemeProvider>
      <SyncSemaphore />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(organizer)/dashboard" />
        <Stack.Screen name="(guest)/kiosk" />
      </Stack>
    </ThemeProvider>
    </AuthProvider>
  );
}
