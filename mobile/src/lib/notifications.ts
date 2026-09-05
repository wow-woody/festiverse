import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Performance } from '@/types/festival';

const STORAGE_KEY = 'scheduled-reminders';
const REMINDER_OFFSETS_MINUTES = [10, 5];

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

async function readReminderMap(): Promise<Record<string, string[]>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeReminderMap(map: Record<string, string[]>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function isReminderSet(performanceId: string) {
  const map = await readReminderMap();
  return Boolean(map[performanceId]?.length);
}

export async function getReminderStatuses(performanceIds: string[]): Promise<Set<string>> {
  const map = await readReminderMap();
  return new Set(performanceIds.filter((id) => map[id]?.length));
}

export async function scheduleReminder(performance: Performance) {
  const startTime = new Date(performance.start_time);
  const notificationIds: string[] = [];

  for (const minutesBefore of REMINDER_OFFSETS_MINUTES) {
    const triggerDate = new Date(startTime.getTime() - minutesBefore * 60 * 1000);
    if (triggerDate.getTime() <= Date.now()) continue;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: performance.artist_name,
        body: performance.stage
          ? `${minutesBefore}분 후 ${performance.stage}에서 시작합니다.`
          : `${minutesBefore}분 후 시작합니다.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    notificationIds.push(notificationId);
  }

  if (notificationIds.length === 0) {
    throw new Error('이미 지났거나 곧 시작하는 공연이라 알림을 예약할 수 없습니다.');
  }

  const map = await readReminderMap();
  map[performance.id] = notificationIds;
  await writeReminderMap(map);
}

export async function cancelReminder(performanceId: string) {
  const map = await readReminderMap();
  const notificationIds = map[performanceId];
  if (notificationIds?.length) {
    await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    delete map[performanceId];
    await writeReminderMap(map);
  }
}
