// Timetable: stage columns × time grid, favorite→watch toggle, local alerts.
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';
import { scheduleSlotAlert, cancelSlotAlert } from '../alerts';
import type { TimetableSlot } from '../api';

function slotLabel(slot: TimetableSlot, artistNames: Map<number, string>): string {
  if (slot.title) return slot.title;
  return slot.artist_ids.map((id) => artistNames.get(id) ?? '?').join(' / ');
}

export function TimetableScreen() {
  const { cache, watches, toggleWatch } = useStore();
  const [date, setDate] = useState<string | null>(null);

  const dates = useMemo(
    () => [...new Set(cache.timetable.map((s) => s.performance_date))].sort(),
    [cache.timetable],
  );
  const activeDate = date ?? dates[0] ?? '';
  const stages = useMemo(
    () => cache.stages.slice().sort((a, b) => a.ordering - b.ordering),
    [cache.stages],
  );
  const artistNames = useMemo(
    () => new Map(cache.artists.map((a) => [a.id, a.display_name ?? a.name])),
    [cache.artists],
  );

  const daySlots = cache.timetable
    .filter((s) => s.performance_date === activeDate)
    .sort((a, b) => a.start_at.localeCompare(b.start_at));

  // Simple grouped list (time rows) — grid layout lands in phase 2.
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateBar}>
        {dates.map((d) => (
          <TouchableOpacity key={d} onPress={() => setDate(d)} style={[styles.dateChip, d === activeDate && styles.dateChipActive]}>
            <Text style={d === activeDate ? styles.dateTextActive : styles.dateText}>{d.slice(5)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
        {daySlots.map((slot) => {
          const stage = stages.find((st) => st.id === slot.stage_id);
          const watched = watches.has(slot.id);
          return (
            <View
              key={slot.id}
              style={[styles.slot, slot.is_cancelled && styles.slotCancelled]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.slotTime, { color: stage?.color_code ?? '#fff' }]}>
                  {slot.start_at.slice(11, 16)} · {stage?.name ?? '?'}
                </Text>
                <Text style={styles.slotTitle}>{slotLabel(slot, artistNames)}</Text>
                {slot.is_cancelled && <Text style={styles.cancelled}>CANCELLED</Text>}
              </View>
              <TouchableOpacity
                onPress={() => {
                  toggleWatch(slot.id);
                  if (watched) void cancelSlotAlert(slot.id);
                  else void scheduleSlotAlert(slot.id, slotLabel(slot, artistNames), new Date(slot.start_at));
                }}
                style={[styles.watchBtn, watched && styles.watchBtnOn]}
              >
                <Text style={watched ? styles.watchBtnTextOn : styles.watchBtnText}>
                  {watched ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        {daySlots.length === 0 && <Text style={styles.empty}>No performances on this date.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  dateBar: { maxHeight: 48, padding: 8 },
  dateChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: '#1a1a1a', marginRight: 8 },
  dateChipActive: { backgroundColor: '#e64219' },
  dateText: { color: '#ccc' },
  dateTextActive: { color: '#fff', fontWeight: '700' },
  slot: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 },
  slotCancelled: { opacity: 0.45 },
  slotTime: { fontSize: 12, fontWeight: '700' },
  slotTitle: { color: '#fff', fontSize: 16, marginTop: 2 },
  cancelled: { color: '#ff5252', fontWeight: '700', marginTop: 4 },
  watchBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a2a2a' },
  watchBtnOn: { backgroundColor: '#e64219' },
  watchBtnText: { color: '#ccc', fontSize: 18 },
  watchBtnTextOn: { color: '#fff', fontSize: 18 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});
