// News: reverse-chron list; flash_report styled distinctly (emergency info).
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';

export function NewsScreen() {
  const { cache } = useStore();
  const items = useMemo(
    () => cache.news.slice().sort((a, b) => (b.publish_at ?? '').localeCompare(a.publish_at ?? '')),
    [cache.news],
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(n) => String(n.id)}
      style={styles.container}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <View style={[styles.card, item.kind === 'flash_report' && styles.flash]}>
          <Text style={styles.kind}>{item.kind === 'flash_report' ? '⚡ FLASH REPORT' : 'NEWS'}</Text>
          <Text style={styles.title}>{item.title}</Text>
          {item.publish_at ? <Text style={styles.date}>{item.publish_at.slice(0, 16).replace('T', ' ')}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 14, marginBottom: 8 },
  flash: { borderLeftWidth: 4, borderLeftColor: '#ff5252' },
  kind: { color: '#888', fontSize: 11, fontWeight: '700' },
  title: { color: '#fff', fontSize: 16, marginTop: 4 },
  date: { color: '#666', fontSize: 12, marginTop: 6 },
});
