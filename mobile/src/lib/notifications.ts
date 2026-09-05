import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Performance } from '@/types/festival';

const STORAGE_KEY = 'scheduled-reminders';
const REMINDER_MINUTES_BEFORE = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationSetup() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function readReminderMap(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeReminderMap(map: Record<string, string>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function isReminderSet(performanceId: string) {
  const map = await readReminderMap();
  return Boolean(map[performanceId]);
}

export async function scheduleReminder(performance: Performance) {
  const startTime = new Date(performance.start_time);
  const triggerDate = new Date(startTime.getTime() - REMINDER_MINUTES_BEFORE * 60 * 1000);

  if (triggerDate.getTime() <= Date.now()) {
    throw new Error('이미 지났거나 곧 시작하는 공연이라 알림을 예약할 수 없습니다.');
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: performance.artist_name,
      body: performance.stage
        ? `${REMINDER_MINUTES_BEFORE}분 후 ${performance.stage}에서 시작합니다.`
        : `${REMINDER_MINUTES_BEFORE}분 후 시작합니다.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  const map = await readReminderMap();
  map[performance.id] = notificationId;
  await writeReminderMap(map);
}

export async function cancelReminder(performanceId: string) {
  const map = await readReminderMap();
  const notificationId = map[performanceId];
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    delete map[performanceId];
    await writeReminderMap(map);
  }
}
