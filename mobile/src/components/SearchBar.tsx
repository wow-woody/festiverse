import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export function SearchBar() {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Pressable style={styles.bar} onPress={() => router.push('/search')}>
        <Ionicons name="search" size={16} color={Colors.textMuted} />
        <Text style={styles.placeholder}>축제 검색하기</Text>
      </Pressable>
      <Pressable style={styles.filterButton}>
        <Ionicons name="options-outline" size={18} color={Colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  placeholder: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
