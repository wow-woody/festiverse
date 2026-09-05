import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, SectionList, StyleSheet, Switch, Text, View } from 'react-native';

import { cancelReminder, isReminderSet, scheduleReminder } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import type { Performance } from '@/types/festival';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'short' });
}

function groupByDay(performances: Performance[]) {
  const sorted = [...performances].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const groups = new Map<string, Performance[]>();
  for (const performance of sorted) {
    const dayKey = performance.start_time.slice(0, 10);
    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey)!.push(performance);
  }
  return Array.from(groups.entries()).map(([dayKey, data]) => ({
    title: formatDayLabel(data[0].start_time),
    data,
  }));
}

function ReminderToggle({ performance }: { performance: Performance }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    isReminderSet(performance.id).then(setEnabled);
  }, [performance.id]);

  const onToggle = async (value: boolean) => {
    setBusy(true);
    try {
      if (value) {
        await scheduleReminder(performance);
      } else {
        await cancelReminder(performance.id);
      }
      setEnabled(value);
    } catch (err) {
      Alert.alert('알림 설정 실패', err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return <Switch value={enabled} disabled={busy} onValueChange={onToggle} />;
}

export default function FestivalScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('performances')
      .select('*')
      .eq('festival_id', id)
      .order('start_time', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPerformances(data ?? []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const sections = useMemo(() => groupByDay(performances), [performances]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>등록된 공연이 없습니다.</Text>
        </View>
      }
      renderSectionHeader={({ section }) => <Text style={styles.dayHeader}>{section.title}</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.artist}>{item.artist_name}</Text>
            <Text style={styles.meta}>
              {formatTime(item.start_time)}
              {item.stage ? ` · ${item.stage}` : ''}
            </Text>
          </View>
          <ReminderToggle performance={item} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  errorText: { color: '#c0392b' },
  list: { padding: 16 },
  dayHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  rowText: { flex: 1, gap: 2, paddingRight: 12 },
  artist: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#555' },
});
