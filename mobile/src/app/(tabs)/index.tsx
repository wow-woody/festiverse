import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FestivalCarousel } from '@/components/FestivalCarousel';
import { SearchBar } from '@/components/SearchBar';
import { Colors, Spacing } from '@/constants/theme';
import { mockFestivals } from '@/data/mockFestivals';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Festival } from '@/types/festival';

const FETCH_TIMEOUT_MS = 4000;

function getTodayStr() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function groupBySchedule(festivals: Festival[]) {
  const todayStr = getTodayStr();
  const upcoming = festivals
    .filter((f) => f.end_date >= todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  const past = festivals
    .filter((f) => f.end_date < todayStr)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
  return { upcoming, past };
}

export default function FestivalListScreen() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Supabase 프로젝트가 아직 연결되지 않음 — 네트워크 요청 없이 바로 더미 데이터 표시.
      setFestivals(mockFestivals);
      setLoading(false);
      return;
    }

    try {
      const query = supabase.from('festivals').select('*').order('start_date', { ascending: true });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS)
      );
      const { data, error: fetchError } = await Promise.race([query, timeout]);

      if (fetchError || !data || data.length === 0) {
        setFestivals(mockFestivals);
      } else {
        setFestivals(data);
      }
    } catch {
      setFestivals(mockFestivals);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { upcoming, past } = useMemo(() => groupBySchedule(festivals), [festivals]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.wordmark}>FESTIVERSE</Text>
      </View>
      <SearchBar />

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.stateText}>불러오는 중...</Text>
        </View>
      ) : festivals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.stateText}>등록된 축제가 없습니다.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <FestivalCarousel title="다가오는 페스티벌" data={upcoming} />
          <FestivalCarousel title="지난 페스티벌" data={past} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  stateText: { color: Colors.textSecondary },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  wordmark: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  body: {
    paddingBottom: Spacing.xl,
  },
});
