import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.title}>준비 중입니다</Text>
        <Text style={styles.subtitle}>찜한 축제를 모아볼 수 있는 화면이 곧 추가돼요.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center' },
});
