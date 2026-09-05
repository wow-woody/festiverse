import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Festival, festivals } from '../data/festivals';
import { buildSearchIndex, matchesQuery } from '../utils/search';

const searchableFestivals = festivals.map((festival) => ({
  festival,
  index: buildSearchIndex(festival.title, festival.location, festival.date, festival.dday),
}));

function FestivalRow({ festival }: { festival: Festival }) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.row}>
      <LinearGradient
        colors={festival.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.thumbnail}
      />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {festival.title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {festival.location}
        </Text>
        <Text style={styles.rowSubtitle}>
          {festival.date} · {festival.dday}
        </Text>
      </View>
      <Text style={styles.chevron}>{'›'}</Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => searchableFestivals.filter(({ index }) => matchesQuery(index, query)).map(({ festival }) => festival),
    [query],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>TRENDING</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="페스티벌을 검색하세요"
          placeholderTextColor="#8f8f8f"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FestivalRow festival={item} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f0ee',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: Platform.select({ android: 8, default: 0 }),
  },
  sectionLabel: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '800',
    color: '#9a9996',
  },
  searchInput: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6e3df',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#121212',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 78,
    paddingVertical: 7,
  },
  thumbnail: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: -0.3,
  },
  rowSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    color: '#7a7a7a',
  },
  chevron: {
    fontSize: 26,
    fontWeight: '700',
    color: '#747474',
  },
  separator: {
    height: 4,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#8f8f8f',
    fontSize: 14,
  },
});
