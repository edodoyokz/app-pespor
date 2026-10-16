// Lineup: artist list + detail with favorites.
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';
import type { Artist } from '../api';

export function LineupScreen() {
  const { cache, favorites, toggleFavorite } = useStore();
  const [selected, setSelected] = useState<Artist | null>(null);

  const artists = useMemo(
    () =>
      cache.artists
        .filter((a) => !a.hide_from_lineup)
        .sort((a, b) => a.ordering - b.ordering),
    [cache.artists],
  );

  if (selected) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelected(null)}>
          <Text style={styles.back}>← Lineup</Text>
        </TouchableOpacity>
        <Text style={styles.detailName}>{selected.display_name ?? selected.name}</Text>
        {selected.description ? <Text style={styles.detailDesc}>{selected.description}</Text> : null}
        <TouchableOpacity
          style={[styles.favBtn, favorites.has(selected.id) && styles.favBtnOn]}
          onPress={() => toggleFavorite(selected.id)}
        >
          <Text style={styles.favBtnText}>{favorites.has(selected.id) ? '★ Favorited' : '☆ Add to favorites'}</Text>
        </TouchableOpacity>
        {selected.twitter_url || selected.instagram_url || selected.official_site ? (
          <View style={styles.links}>
            {selected.official_site ? <Text style={styles.link}>Official site</Text> : null}
            {selected.twitter_url ? <Text style={styles.link}>X / Twitter</Text> : null}
            {selected.instagram_url ? <Text style={styles.link}>Instagram</Text> : null}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <FlatList
      data={artists}
      keyExtractor={(a) => String(a.id)}
      style={styles.container}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
          <Text style={styles.rowName}>{item.display_name ?? item.name}</Text>
          {favorites.has(item.id) ? <Text style={styles.star}>★</Text> : null}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 14, marginBottom: 8 },
  rowName: { color: '#fff', fontSize: 16 },
  star: { color: '#e64219' },
  back: { color: '#e64219', padding: 12 },
  detailName: { color: '#fff', fontSize: 24, fontWeight: '700', paddingHorizontal: 16, marginTop: 8 },
  detailDesc: { color: '#ccc', paddingHorizontal: 16, marginTop: 12, lineHeight: 20 },
  favBtn: { marginHorizontal: 16, marginTop: 20, padding: 12, borderRadius: 8, backgroundColor: '#2a2a2a', alignItems: 'center' },
  favBtnOn: { backgroundColor: '#e64219' },
  favBtnText: { color: '#fff', fontWeight: '600' },
  links: { paddingHorizontal: 16, marginTop: 20 },
  link: { color: '#2196f3', paddingVertical: 6 },
});
