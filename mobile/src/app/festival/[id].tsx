import { useLocalSearchParams } from 'expo-router';
import { LayoutGrid, Star, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { TimetableGrid, getSetStatus } from '@/components/timetable/TimetableGrid';
import { SetDetailModal } from '@/components/timetable/SetDetailModal';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { mockPerformancesByFestivalId } from '@/data/mockPerformances';
import { getStageColor } from '@/lib/stageColors';
import { cancelReminder, getReminderStatuses, scheduleReminder } from '@/lib/notifications';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Performance } from '@/types/festival';

const FETCH_TIMEOUT_MS = 4000;
const NOW_REFRESH_MS = 60000;

function dayKeyOf(iso: string) {
  return iso.slice(0, 10);
}

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'short' });
}

function getTodayKey() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// selectedIds로 표시된(알림을 켠) 공연들끼리 시간이 겹치는지 검사.
// end_time이 없는 공연은 겹침 여부를 알 수 없으니 검사에서 제외함.
function findOverlappingIds(performances: Performance[], selectedIds: Set<string>) {
  const selected = performances.filter((p) => selectedIds.has(p.id) && p.end_time);
  const overlapping = new Set<string>();

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i];
      const b = selected[j];
      const aStart = new Date(a.start_time).getTime();
      const aEnd = new Date(a.end_time!).getTime();
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time!).getTime();

      if (aStart < bEnd && bStart < aEnd) {
        overlapping.add(a.id);
        overlapping.add(b.id);
      }
    }
  }
  return overlapping;
}

export default function FestivalScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'mine'>('grid');
  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    let result: Performance[] = [];

    if (!isSupabaseConfigured) {
      // Supabase 프로젝트가 아직 연결되지 않음 — 네트워크 요청 없이 바로 더미 데이터 표시.
      result = mockPerformancesByFestivalId[id] ?? [];
    } else {
      try {
        const query = supabase
          .from('performances')
          .select('*')
          .eq('festival_id', id)
          .order('start_time', { ascending: true });
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS)
        );
        const { data, error: fetchError } = await Promise.race([query, timeout]);

        if (fetchError || !data || data.length === 0) {
          result = mockPerformancesByFestivalId[id] ?? [];
        } else {
          result = data;
        }
      } catch {
        result = mockPerformancesByFestivalId[id] ?? [];
      }
    }

    setPerformances(result);
    setSelectedIds(await getReminderStatuses(result.map((p) => p.id)));

    const resultDayKeys = Array.from(new Set(result.map((p) => dayKeyOf(p.start_time)))).sort();
    const todayKey = getTodayKey();
    // 오늘 진행 중인 축제면 오늘 날짜 탭을 기본으로 보여줌 (그래야 NOW 라인이 바로 보임).
    setActiveDayKey(resultDayKeys.includes(todayKey) ? todayKey : (resultDayKeys[0] ?? null));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), NOW_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const dayKeys = useMemo(
    () => Array.from(new Set(performances.map((p) => dayKeyOf(p.start_time)))).sort(),
    [performances]
  );

  const stageOrder = useMemo(() => {
    const names = new Set<string>();
    for (const p of performances) if (p.stage) names.add(p.stage);
    return Array.from(names);
  }, [performances]);

  const overlappingIds = useMemo(
    () => findOverlappingIds(performances, selectedIds),
    [performances, selectedIds]
  );

  const todayKey = getTodayKey();
  // 이 축제가 오늘(당일) 진행되는 게 아니면 NOW 라인/LIVE 효과를 아예 끔.
  const isFestivalToday =
    dayKeys.length > 0 && todayKey >= dayKeys[0] && todayKey <= dayKeys[dayKeys.length - 1];
  const effectiveTodayKey = isFestivalToday ? todayKey : '';

  const onToggle = async (performance: Performance, value: boolean) => {
    setBusyIds((prev) => new Set(prev).add(performance.id));
    try {
      if (value) {
        await scheduleReminder(performance);
      } else {
        await cancelReminder(performance.id);
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        value ? next.add(performance.id) : next.delete(performance.id);
        return next;
      });
    } catch (err) {
      Alert.alert('알림 설정 실패', err instanceof Error ? err.message : String(err));
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(performance.id);
        return next;
      });
    }
  };

  const dayPerformances = useMemo(
    () => performances.filter((p) => dayKeyOf(p.start_time) === activeDayKey),
    [performances, activeDayKey]
  );

  const mySections = useMemo(() => {
    const mine = performances.filter((p) => selectedIds.has(p.id)).sort((a, b) => a.start_time.localeCompare(b.start_time));
    const groups = new Map<string, Performance[]>();
    for (const p of mine) {
      const key = dayKeyOf(p.start_time);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    return Array.from(groups.entries()).map(([key, data]) => ({
      title: formatDayLabel(data[0].start_time),
      data,
    }));
  }, [performances, selectedIds]);

  const selectedPerformance = performances.find((p) => p.id === selectedPerformanceId) ?? null;
  const selectedConflictNames = useMemo(() => {
    if (!selectedPerformance || !overlappingIds.has(selectedPerformance.id)) return [];
    return performances
      .filter(
        (p) =>
          selectedIds.has(p.id) &&
          p.id !== selectedPerformance.id &&
          p.end_time &&
          selectedPerformance.end_time &&
          new Date(p.start_time).getTime() < new Date(selectedPerformance.end_time).getTime() &&
          new Date(selectedPerformance.start_time).getTime() < new Date(p.end_time).getTime()
      )
      .map((p) => p.artist_name);
  }, [selectedPerformance, overlappingIds, selectedIds, performances]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>불러오는 중...</Text>
      </View>
    );
  }

  if (performances.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>등록된 공연이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <View style={styles.segmented}>
          <SegmentButton
            active={viewMode === 'mine'}
            icon={<Star size={14} color={viewMode === 'mine' ? '#0a0a0a' : Colors.textSecondary} />}
            label={`내 일정${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            onPress={() => setViewMode('mine')}
          />
          <SegmentButton
            active={viewMode === 'grid'}
            icon={<LayoutGrid size={14} color={viewMode === 'grid' ? '#0a0a0a' : Colors.textSecondary} />}
            label="타임테이블"
            onPress={() => setViewMode('grid')}
          />
        </View>

        {viewMode === 'grid' && dayKeys.length > 1 ? (
          <View style={styles.dayTabs}>
            {dayKeys.map((key, i) => (
              <Pressable
                key={key}
                onPress={() => setActiveDayKey(key)}
                style={[styles.dayTab, activeDayKey === key && styles.dayTabActive]}
              >
                <Text style={[styles.dayTabText, activeDayKey === key && styles.dayTabTextActive]}>DAY {i + 1}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {overlappingIds.size > 0 ? (
          <Pressable style={styles.conflictBanner} onPress={() => setViewMode('mine')}>
            <Text style={styles.conflictBannerText}>⚠ 알림 켠 일정 {overlappingIds.size}개가 겹쳐요 · 확인하기</Text>
          </Pressable>
        ) : null}
      </View>

      {viewMode === 'grid' ? (
        <TimetableGrid
          performances={dayPerformances}
          dayKey={activeDayKey ?? ''}
          todayKey={effectiveTodayKey}
          nowMs={nowMs}
          stageOrder={stageOrder}
          selectedIds={selectedIds}
          overlappingIds={overlappingIds}
          onOpen={(p) => setSelectedPerformanceId(p.id)}
          onToggleFavorite={(p) => onToggle(p, !selectedIds.has(p.id))}
        />
      ) : (
        <SectionList
          sections={mySections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Star size={28} color={Colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={styles.stateText}>알림을 켠 공연이 없어요</Text>
              <Text style={styles.emptyHint}>타임테이블에서 별 아이콘을 눌러 추가해보세요</Text>
            </View>
          }
          renderSectionHeader={({ section }) => <Text style={styles.dayHeader}>{section.title}</Text>}
          renderItem={({ item }) => {
            const status = getSetStatus(item, dayKeyOf(item.start_time), effectiveTodayKey, nowMs);
            const conflicted = overlappingIds.has(item.id);
            return (
              <Pressable
                style={[styles.row, { borderLeftColor: getStageColor(item.stage, stageOrder) }]}
                onPress={() => setSelectedPerformanceId(item.id)}
              >
                <View style={styles.rowText}>
                  <View style={styles.rowTopLine}>
                    {item.stage ? <Text style={[styles.stageTag, { color: getStageColor(item.stage, stageOrder) }]}>{item.stage}</Text> : null}
                    {conflicted ? <Text style={styles.conflictTag}>⚠ 겹침</Text> : null}
                    {status === 'live' ? <Text style={styles.liveTag}>· LIVE</Text> : null}
                  </View>
                  <Text style={styles.artist}>{item.artist_name}</Text>
                  <Text style={styles.meta}>
                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {item.end_time ? ` – ${new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </Text>
                </View>
                <Pressable hitSlop={8} onPress={() => onToggle(item, false)} disabled={busyIds.has(item.id)}>
                  <X size={18} color={Colors.textMuted} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}

      {selectedPerformance ? (
        <SetDetailModal
          performance={selectedPerformance}
          status={getSetStatus(selectedPerformance, dayKeyOf(selectedPerformance.start_time), effectiveTodayKey, nowMs)}
          stageColor={getStageColor(selectedPerformance.stage, stageOrder)}
          favorited={selectedIds.has(selectedPerformance.id)}
          busy={busyIds.has(selectedPerformance.id)}
          conflictNames={selectedConflictNames}
          minutesUntilStart={Math.round((new Date(selectedPerformance.start_time).getTime() - nowMs) / 60000)}
          onToggleFavorite={() => onToggle(selectedPerformance, !selectedIds.has(selectedPerformance.id))}
          onClose={() => setSelectedPerformanceId(null)}
        />
      ) : null}
    </View>
  );
}

function SegmentButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={onPress}>
      {icon}
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, backgroundColor: Colors.background },
  stateText: { color: Colors.textSecondary },
  emptyHint: { color: Colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  toolbar: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.sm },
  segmented: { flexDirection: 'row', gap: Spacing.sm },
  segmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
  segmentButtonActive: { backgroundColor: '#ffffff' },
  segmentText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  segmentTextActive: { color: '#0a0a0a' },
  dayTabs: { flexDirection: 'row', gap: Spacing.sm },
  dayTab: {
    paddingHorizontal: 12,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayTabActive: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  dayTabText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  dayTabTextActive: { color: '#0a0a0a' },
  conflictBanner: {
    backgroundColor: 'rgba(255,107,91,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,91,0.3)',
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  conflictBannerText: { color: '#ff6b5b', fontSize: 12, fontWeight: '600' },
  list: { padding: Spacing.lg },
  dayHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  rowText: { flex: 1, gap: 2, paddingRight: 12 },
  rowTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stageTag: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  conflictTag: { color: '#ff6b5b', fontSize: 10, fontWeight: '700' },
  liveTag: { color: Colors.accentTo, fontSize: 10, fontWeight: '700' },
  artist: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  meta: { color: Colors.textSecondary, fontVariant: ['tabular-nums'] },
});
