import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Festival } from '@/types/festival';

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;
  return start === end ? fmt(startDate) : `${fmt(startDate)} - ${fmt(endDate)}`;
}

export default function FestivalListScreen() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('festivals')
      .select('*')
      .order('start_date', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setFestivals(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    <FlatList
      data={festivals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>등록된 축제가 없습니다.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={`/festival/${item.id}`} asChild>
          <Pressable style={styles.card}>
            {item.cover_image_url ? (
              <Image source={{ uri: item.cover_image_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]} />
            )}
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {formatDateRange(item.start_date, item.end_date)}
                {item.location ? ` · ${item.location}` : ''}
              </Text>
            </View>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  errorText: { color: '#c0392b' },
  list: { padding: 16, gap: 12 },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    marginBottom: 12,
  },
  cover: { width: '100%', height: 140 },
  coverPlaceholder: { backgroundColor: '#ddd' },
  cardBody: { padding: 12, gap: 4 },
  name: { fontSize: 18, fontWeight: '600' },
  meta: { color: '#555' },
});
