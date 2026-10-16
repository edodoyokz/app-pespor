// Stamp rally: check-in via QR token entry (camera scan in phase 2),
// progress display, prize password on completion. Offline-safe via store queue.
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';
import { api } from '../api';

type Status = { id: number; rally_id: number; name: string; checked_in: boolean };

export function StampScreen() {
  const { cache, festival, userId } = useStore();
  const [status, setStatus] = useState<Status[]>([]);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [prize, setPrize] = useState<string | null>(null);

  const rally = cache.stampRallies[0];

  const refresh = async () => {
    if (!festival || !userId) return;
    try {
      setStatus(await api.stampStatus(userId, festival.id));
    } catch {
      // offline — show cached rally definition only
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festival?.id, userId]);

  const checkin = async () => {
    if (!userId || token.length === 0) return;
    try {
      const res = await api.stampCheckin(userId, token.trim());
      if (res.rally_complete) {
        setMessage(rally?.complete_message ?? 'Rally complete!');
        setPrize(res.prize_password ?? null);
      } else {
        setMessage(`Checked in! ${res.done}/${res.total}`);
      }
      setToken('');
      await refresh();
    } catch {
      setMessage('Offline — check-in queued, will sync automatically.');
    }
  };

  const done = status.filter((s) => s.checked_in).length;

  return (
    <View style={styles.container}>
      {rally ? (
        <>
          <Text style={styles.rallyName}>{rally.name}</Text>
          {rally.explanation ? <Text style={styles.explanation}>{rally.explanation}</Text> : null}
          <Text style={styles.progress}>
            {status.length > 0 ? `${done}/${status.length}` : '—'}
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="QR token"
              placeholderTextColor="#666"
              value={token}
              onChangeText={setToken}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.checkinBtn} onPress={() => void checkin()}>
              <Text style={styles.checkinText}>Check in</Text>
            </TouchableOpacity>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}
          {prize ? (
            <View style={styles.prizeBox}>
              <Text style={styles.prizeLabel}>Prize password</Text>
              <Text style={styles.prizeValue}>{prize}</Text>
            </View>
          ) : null}

          {status.map((s) => (
            <View key={s.id} style={styles.pointRow}>
              <Text style={styles.pointCheck}>{s.checked_in ? '✅' : '⬜'}</Text>
              <Text style={styles.pointName}>{s.name}</Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={styles.empty}>No stamp rally active.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16 },
  rallyName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  explanation: { color: '#aaa', marginTop: 6 },
  progress: { color: '#e64219', fontSize: 28, fontWeight: '700', marginVertical: 16 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  checkinBtn: { backgroundColor: '#e64219', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  checkinText: { color: '#fff', fontWeight: '700' },
  message: { color: '#4caf50', marginBottom: 12 },
  prizeBox: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 14, marginBottom: 12 },
  prizeLabel: { color: '#888', fontSize: 12 },
  prizeValue: { color: '#ffb300', fontSize: 20, fontWeight: '700', marginTop: 4 },
  pointRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  pointCheck: { marginRight: 10 },
  pointName: { color: '#fff' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});
