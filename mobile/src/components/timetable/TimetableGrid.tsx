import { AlertTriangle, Star } from 'lucide-react-native';
import { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { getStageColor } from '@/lib/stageColors';
import type { Performance } from '@/types/festival';

export const HEADER_H = 40;
const TIME_COL_W = 46;
const STAGE_COL_W = 126;
const PX_PER_MIN = 1.6;

export type SetStatus = 'ended' | 'live' | 'upcoming';

export function getSetStatus(
  performance: Performance,
  dayKey: string,
  todayKey: string,
  nowMs: number
): SetStatus {
  if (dayKey < todayKey) return 'ended';
  if (dayKey > todayKey) return 'upcoming';

  const start = new Date(performance.start_time).getTime();
  const end = performance.end_time ? new Date(performance.end_time).getTime() : start + 60 * 60 * 1000;
  if (end <= nowMs) return 'ended';
  if (start <= nowMs && nowMs < end) return 'live';
  return 'upcoming';
}

function minutesOfDay(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

// end_time이 다음날로 넘어가는 공연(자정 이후 종료)도 자정선을 넘겨 올바르게 계산되도록
// "당일 자정 기준 분"이 아니라 start로부터의 실제 경과 시간을 더해서 구함.
function getEndMinutesOfDay(performance: Performance) {
  const start = minutesOfDay(performance.start_time);
  if (!performance.end_time) return start + 60;
  const durationMs = new Date(performance.end_time).getTime() - new Date(performance.start_time).getTime();
  return start + durationMs / 60000;
}

function formatHour(min: number) {
  const h = Math.floor(min / 60) % 24;
  return `${String(h).padStart(2, '0')}:00`;
}

function TimetableBlock({
  performance,
  stageIndex,
  top,
  height,
  color,
  status,
  favorited,
  conflicted,
  onOpen,
  onToggleFavorite,
}: {
  performance: Performance;
  stageIndex: number;
  top: number;
  height: number;
  color: string;
  status: SetStatus;
  favorited: boolean;
  conflicted: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
}) {
  const compact = height < 46;

  return (
    <Pressable
      onPress={onOpen}
      style={[
        styles.block,
        {
          top,
          left: stageIndex * STAGE_COL_W + 3,
          width: STAGE_COL_W - 6,
          height,
          backgroundColor: `${color}${status === 'live' ? '4d' : '26'}`,
          borderLeftColor: color,
          opacity: status === 'ended' ? 0.45 : 1,
        },
        favorited && styles.blockFavorited,
      ]}
    >
      {conflicted ? (
        <AlertTriangle size={11} color="#ff6b5b" style={styles.conflictIcon} />
      ) : null}
      <Pressable
        style={styles.favoriteButton}
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Star size={13} color={favorited ? Colors.warning : 'rgba(255,255,255,0.35)'} fill={favorited ? Colors.warning : 'none'} />
      </Pressable>
      <Text style={styles.blockArtist} numberOfLines={2}>
        {performance.artist_name}
      </Text>
      {!compact && performance.genre ? <Text style={styles.blockGenre}>{performance.genre}</Text> : null}
      {!compact ? (
        <Text style={styles.blockTime}>{new Date(performance.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      ) : null}
      {status === 'live' ? <Text style={styles.liveLabel}>● LIVE</Text> : null}
    </Pressable>
  );
}

export function TimetableGrid({
  performances,
  dayKey,
  todayKey,
  nowMs,
  stageOrder,
  selectedIds,
  overlappingIds,
  onOpen,
  onToggleFavorite,
}: {
  performances: Performance[];
  dayKey: string;
  todayKey: string;
  nowMs: number;
  stageOrder: string[];
  selectedIds: Set<string>;
  overlappingIds: Set<string>;
  onOpen: (performance: Performance) => void;
  onToggleFavorite: (performance: Performance) => void;
}) {
  const timeColRef = useRef<ScrollView>(null);
  const bodyRef = useRef<ScrollView>(null);

  if (performances.length === 0 || stageOrder.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>이 날짜에는 등록된 공연이 없습니다.</Text>
      </View>
    );
  }

  const starts = performances.map((p) => minutesOfDay(p.start_time));
  const ends = performances.map((p) => getEndMinutesOfDay(p));
  const dayStart = Math.floor(Math.min(...starts) / 60) * 60;
  const dayEnd = Math.ceil(Math.max(...ends) / 60) * 60;
  const timelineHeight = (dayEnd - dayStart) * PX_PER_MIN;

  const ticks: number[] = [];
  for (let t = dayStart; t <= dayEnd; t += 60) ticks.push(t);

  const showNowLine = dayKey === todayKey;
  const nowDate = new Date(nowMs);
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
  const nowVisible = showNowLine && nowMinutes >= dayStart && nowMinutes <= dayEnd;
  const nowY = (nowMinutes - dayStart) * PX_PER_MIN;

  const onBodyScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    timeColRef.current?.scrollTo({ y: e.nativeEvent.contentOffset.y, animated: false });
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <View style={{ height: HEADER_H }} />
        <ScrollView ref={timeColRef} scrollEnabled={false} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ height: timelineHeight }}>
            {ticks.map((t) => (
              <Text key={t} style={[styles.tickLabel, { top: (t - dayStart) * PX_PER_MIN - 6 }]}>
                {formatHour(t)}
              </Text>
            ))}
            {nowVisible ? <Text style={[styles.nowLabel, { top: nowY - 7 }]}>NOW</Text> : null}
          </View>
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        <View>
          <View style={[styles.headerRow, { width: stageOrder.length * STAGE_COL_W }]}>
            {stageOrder.map((stageName, i) => {
              const color = getStageColor(stageName, stageOrder);
              return (
                <View key={stageName} style={[styles.headerCell, { width: STAGE_COL_W }]}>
                  <View style={[styles.headerDot, { backgroundColor: color }]} />
                  <Text style={styles.headerText} numberOfLines={1}>
                    {stageName}
                  </Text>
                </View>
              );
            })}
          </View>

          <ScrollView
            ref={bodyRef}
            onScroll={onBodyScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <View style={{ width: stageOrder.length * STAGE_COL_W, height: timelineHeight }}>
              {ticks.map((t) => (
                <View key={t} style={[styles.gridLine, { top: (t - dayStart) * PX_PER_MIN }]} />
              ))}
              {stageOrder.slice(1).map((_, i) => (
                <View key={i} style={[styles.stageDivider, { left: (i + 1) * STAGE_COL_W }]} />
              ))}

              {performances.map((performance) => {
                const stageIndex = stageOrder.indexOf(performance.stage ?? '');
                if (stageIndex === -1) return null;
                const start = minutesOfDay(performance.start_time);
                const end = getEndMinutesOfDay(performance);
                const top = (start - dayStart) * PX_PER_MIN;
                const height = Math.max((end - start) * PX_PER_MIN - 4, 32);

                return (
                  <TimetableBlock
                    key={performance.id}
                    performance={performance}
                    stageIndex={stageIndex}
                    top={top}
                    height={height}
                    color={getStageColor(performance.stage, stageOrder)}
                    status={getSetStatus(performance, dayKey, todayKey, nowMs)}
                    favorited={selectedIds.has(performance.id)}
                    conflicted={overlappingIds.has(performance.id)}
                    onOpen={() => onOpen(performance)}
                    onToggleFavorite={() => onToggleFavorite(performance)}
                  />
                );
              })}

              {nowVisible ? <View style={[styles.nowLine, { top: nowY }]} /> : null}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textSecondary },
  timeColumn: { width: TIME_COL_W },
  tickLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  nowLabel: {
    position: 'absolute',
    left: 2,
    right: 2,
    textAlign: 'center',
    backgroundColor: Colors.accentTo,
    color: '#0a0a0a',
    fontSize: 9,
    fontWeight: '800',
    borderRadius: 4,
  },
  headerRow: { flexDirection: 'row', height: HEADER_H },
  headerCell: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  headerDot: { width: 6, height: 6, borderRadius: 3 },
  headerText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.border },
  stageDivider: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: Colors.border },
  nowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.accentTo,
  },
  block: {
    position: 'absolute',
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    padding: 6,
    overflow: 'hidden',
  },
  blockFavorited: {
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  conflictIcon: { position: 'absolute', top: 5, left: 5 },
  favoriteButton: { position: 'absolute', top: 2, right: 2, padding: 3 },
  blockArtist: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700', paddingRight: 14, lineHeight: 15 },
  blockGenre: { color: Colors.textMuted, fontSize: 9, marginTop: 2 },
  blockTime: { color: Colors.textMuted, fontSize: 9, marginTop: 1, fontVariant: ['tabular-nums'] },
  liveLabel: { position: 'absolute', bottom: 4, right: 6, fontSize: 8, color: Colors.accentTo, fontWeight: '800' },
});
