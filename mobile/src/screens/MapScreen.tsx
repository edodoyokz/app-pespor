// Map: static floor image + absolutely-positioned pins (phase-1 mode),
// mirroring the original normalMode; Mapbox mode deferred until needed.
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';
import type { MapPoint } from '../api';

const PIN_COLORS: Record<string, string> = {
  stage: '#e64219',
  food: '#ffb300',
  shop: '#2196f3',
  first_aid: '#4caf50',
  water: '#00bcd4',
  toilet: '#9c27b0',
  custom: '#888888',
};

function pinColor(pointType: string): string {
  return PIN_COLORS[pointType] ?? PIN_COLORS.custom;
}

export function MapScreen() {
  const { cache } = useStore();
  const floors = useMemo(() => cache.mapFloors.slice().sort((a, b) => a.ordering - b.ordering), [cache.mapFloors]);
  const [floorId, setFloorId] = useState<number | null>(null);
  const [selected, setSelected] = useState<MapPoint | null>(null);

  const activeFloor = floors.find((f) => f.id === floorId) ?? floors[0];
  const points = cache.mapPoints.filter((p) => p.floor_id === activeFloor?.id);

  if (!activeFloor) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.empty}>No map available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {floors.length > 1 && (
        <ScrollView horizontal style={styles.floorBar} showsHorizontalScrollIndicator={false}>
          {floors.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => { setFloorId(f.id); setSelected(null); }}
              style={[styles.floorChip, f.id === activeFloor.id && styles.floorChipActive]}
            >
              <Text style={f.id === activeFloor.id ? styles.floorTextActive : styles.floorText}>{f.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView maximumZoomScale={3} minimumZoomScale={1} contentContainerStyle={styles.mapWrap}>
        <View style={{ width: activeFloor.image_width ?? 800, height: activeFloor.image_height ?? 600 }}>
          <Image
            source={{ uri: activeFloor.map_image }}
            style={StyleSheet.absoluteFill}
            resizeMode="stretch"
          />
          {points.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelected(p)}
              style={[styles.pin, { left: (p.location_x ?? 0) - 10, top: (p.location_y ?? 0) - 10, backgroundColor: pinColor(p.point_type) }]}
            >
              <Text style={styles.pinText}>{p.name.slice(0, 1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selected && (
        <View style={styles.detail}>
          <Text style={styles.detailName}>{selected.name}</Text>
          <Text style={styles.detailType}>{selected.point_type}</Text>
          {selected.description ? <Text style={styles.detailDesc}>{selected.description}</Text> : null}
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={styles.detailClose}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  floorBar: { maxHeight: 48, padding: 8 },
  floorChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#1a1a1a', marginRight: 8 },
  floorChipActive: { backgroundColor: '#e64219' },
  floorText: { color: '#ccc' },
  floorTextActive: { color: '#fff', fontWeight: '700' },
  mapWrap: { padding: 12 },
  pin: { position: 'absolute', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pinText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  detail: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a1a', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  detailName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  detailType: { color: '#e64219', fontSize: 12, marginTop: 2 },
  detailDesc: { color: '#ccc', marginTop: 8 },
  detailClose: { color: '#888', marginTop: 12 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#888' },
});
