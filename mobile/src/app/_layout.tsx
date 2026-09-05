import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { ensureNotificationSetup } from '@/lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    ensureNotificationSetup();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '페스티벌' }} />
      <Stack.Screen name="festival/[id]" options={{ title: '일정' }} />
    </Stack>
  );
}
