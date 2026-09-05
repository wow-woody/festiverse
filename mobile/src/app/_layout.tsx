import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { ensureNotificationSetup } from '@/lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    ensureNotificationSetup();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="festival/[id]" options={{ title: '일정' }} />
    </Stack>
  );
}
