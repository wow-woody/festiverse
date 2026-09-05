import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AccentGradient, Colors, Radius, Spacing } from '@/constants/theme';
import type { Festival } from '@/types/festival';

const CARD_WIDTH = 148;

function formatDateRange(start: string, end: string) {
  return start === end ? start : `${start} – ${end}`;
}

function getDdayLabel(start: string, end: string) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  if (todayStr >= start && todayStr <= end) return 'LIVE';

  const diffDays = Math.round(
    (new Date(start).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'D-DAY';
  return `D-${diffDays}`;
}

function DdayBadge({ start, end }: { start: string; end: string }) {
  const label = getDdayLabel(start, end);
  if (!label) return null;

  return (
    <LinearGradient
      colors={AccentGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.badge}
    >
      <Text style={styles.badgeText}>{label}</Text>
    </LinearGradient>
  );
}

export function FestivalCard({ festival }: { festival: Festival }) {
  return (
    <Link href={`/festival/${festival.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.coverWrapper}>
          {festival.cover_image_url ? (
            <Image source={{ uri: festival.cover_image_url }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]} />
          )}
          <View style={styles.badgeSlot}>
            <DdayBadge start={festival.start_date} end={festival.end_date} />
          </View>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={2}>
            {festival.name}
          </Text>
          {festival.location ? (
            <Text style={styles.meta} numberOfLines={1}>
              {festival.location}
            </Text>
          ) : null}
          <Text style={styles.date}>{formatDateRange(festival.start_date, festival.end_date)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export { CARD_WIDTH };

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH },
  coverWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  cover: StyleSheet.absoluteFill,
  coverPlaceholder: { backgroundColor: Colors.surfaceAlt },
  badgeSlot: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  badgeText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  textBlock: {
    marginTop: Spacing.sm,
    gap: 2,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  date: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontVariant: ['tabular-nums'],
  },
});
