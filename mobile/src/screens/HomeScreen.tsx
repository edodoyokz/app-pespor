// Home: CMS home buttons + latest news + festival header.
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';

export function HomeScreen() {
  const { cache, festival, festivals, selectFestival } = useStore();
  const layout = cache.layout;
  const buttons = layout?.home_buttons ?? [];
  const latestNews = cache.news.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {layout?.logo ? <Image source={{ uri: layout.logo }} style={styles.logo} resizeMode="contain" /> : null}
      <Text style={styles.festivalName}>{festival?.name}</Text>
      <Text style={styles.dates}>
        {festival ? `${festival.start_at.slice(0, 10)} — ${festival.end_at.slice(0, 10)}` : ''}
      </Text>

      <View style={styles.buttonRow}>
        {buttons.map((b) => (
          <TouchableOpacity
            key={b.name}
            style={[styles.homeButton, { backgroundColor: layout?.button_color ?? '#e64219' }]}
            onPress={() => {
              /* destination handled in phase 2: webview or screen alias */
            }}
          >
            <Text style={styles.homeButtonText}>{b.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {festivals.length > 1 && (
        <View style={styles.festSwitcher}>
          <Text style={styles.sectionTitle}>Switch festival</Text>
          {festivals.map((f) => (
            <TouchableOpacity key={f.id} style={styles.festRow} onPress={() => void selectFestival(f)}>
              <Text style={f.id === festival?.id ? styles.festActive : styles.festName}>{f.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Latest news</Text>
      {latestNews.map((n) => (
        <View key={n.id} style={styles.newsCard}>
          <Text style={styles.newsTitle}>{n.title}</Text>
          {n.publish_at ? <Text style={styles.newsDate}>{n.publish_at.slice(0, 10)}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  logo: { width: 200, height: 60, alignSelf: 'center', marginTop: 16 },
  festivalName: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  dates: { color: '#aaa', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  homeButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  homeButtonText: { color: '#fff', fontWeight: '600' },
  festSwitcher: { marginBottom: 24 },
  festRow: { paddingVertical: 8 },
  festName: { color: '#ccc' },
  festActive: { color: '#e64219', fontWeight: '700' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  newsCard: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 },
  newsTitle: { color: '#fff' },
  newsDate: { color: '#888', fontSize: 12, marginTop: 4 },
});
