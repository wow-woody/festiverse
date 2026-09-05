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
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="festival/[id]" options={{ title: '타임테이블' }} />
    </Stack>
  );
}
