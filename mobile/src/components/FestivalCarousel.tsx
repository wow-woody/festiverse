import { FlatList, StyleSheet, Text, View } from 'react-native';

import { FestivalCard } from '@/components/FestivalCard';
import { Colors, Spacing } from '@/constants/theme';
import type { Festival } from '@/types/festival';

export function FestivalCarousel({ title, data }: { title: string; data: Festival[] }) {
  if (data.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.seeAll}>전체보기</Text>
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.row}
        renderItem={({ item }) => <FestivalCard festival={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
});
