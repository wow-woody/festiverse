import { AlertTriangle, Star, X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { SetStatus } from '@/components/timetable/TimetableGrid';
import type { Performance } from '@/types/festival';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function SetDetailModal({
  performance,
  status,
  stageColor,
  favorited,
  busy,
  conflictNames,
  minutesUntilStart,
  onToggleFavorite,
  onClose,
}: {
  performance: Performance;
  status: SetStatus;
  stageColor: string;
  favorited: boolean;
  busy: boolean;
  conflictNames: string[];
  minutesUntilStart: number;
  onToggleFavorite: () => void;
  onClose: () => void;
}) {
  const durationMin = performance.end_time
    ? Math.round((new Date(performance.end_time).getTime() - new Date(performance.start_time).getTime()) / 60000)
    : null;

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { borderTopColor: stageColor }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              {performance.stage ? (
                <Text style={[styles.stageLabel, { color: stageColor }]}>{performance.stage}</Text>
              ) : null}
              <Text style={styles.artist}>{performance.artist_name}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.timeRange}>
              {formatTime(performance.start_time)}
              {performance.end_time ? ` – ${formatTime(performance.end_time)}` : ''}
            </Text>
            {durationMin ? <Text style={styles.metaText}>· {durationMin}분</Text> : null}
            {performance.genre ? (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{performance.genre}</Text>
              </View>
            ) : null}
            {performance.headliner ? (
              <View style={[styles.pill, styles.headlinerPill]}>
                <Text style={[styles.pillText, styles.headlinerPillText]}>HEADLINER</Text>
              </View>
            ) : null}
          </View>

          {status === 'live' ? (
            <StatusPill color={Colors.accentTo} text="지금 진행 중" />
          ) : status === 'upcoming' ? (
            <StatusPill
              color={stageColor}
              text={minutesUntilStart > 0 ? `${minutesUntilStart}분 후 시작` : '곧 시작'}
            />
          ) : (
            <StatusPill color={Colors.textMuted} text="종료된 공연" />
          )}

          {conflictNames.length > 0 ? (
            <View style={styles.conflictBox}>
              <AlertTriangle size={14} color="#ff6b5b" style={{ marginTop: 1 }} />
              <Text style={styles.conflictText}>이 시간에 겹치는 관심 공연: {conflictNames.join(', ')}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.favoriteButton, favorited && styles.favoriteButtonActive]}
            disabled={busy}
            onPress={onToggleFavorite}
          >
            <Star size={16} color={favorited ? '#1a1206' : Colors.textPrimary} fill={favorited ? '#1a1206' : 'none'} />
            <Text style={[styles.favoriteButtonText, favorited && styles.favoriteButtonTextActive]}>
              {favorited ? '알림 해제' : '알림 받기 (10분·5분 전)'}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function StatusPill({ color, text }: { color: string; text: string }) {
  return (
    <View style={[styles.statusPill, { backgroundColor: `${color}26`, borderColor: `${color}66` }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopWidth: 3,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stageLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  artist: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  timeRange: { color: Colors.textPrimary, fontSize: 14, fontVariant: ['tabular-nums'] },
  metaText: { color: Colors.textSecondary, fontSize: 12 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
  headlinerPill: { backgroundColor: `${Colors.warning}26` },
  headlinerPillText: { color: Colors.warning },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  conflictBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,107,91,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,91,0.3)',
  },
  conflictText: { color: '#ff6b5b', fontSize: 12, flex: 1 },
  favoriteButton: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  favoriteButtonActive: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  favoriteButtonText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  favoriteButtonTextActive: { color: '#1a1206' },
});
