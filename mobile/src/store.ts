// Global store — festival selection, synced cache, user identity, favorites/watches.
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { restoreCache, syncAll, enqueue, flushQueue } from './sync';
import type { ContentCache } from './sync';
import type { Festival } from './api';

// Device-scoped anonymous user id (stands in for account auth in phase 1).
async function ensureUserId(): Promise<string> {
  const existing = await AsyncStorage.getItem('user_id');
  if (existing) return existing;
  const id = `dev_${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem('user_id', id);
  return id;
}

type StoreState = {
  festival: Festival | null;
  festivals: Festival[];
  cache: ContentCache;
  userId: string | null;
  favorites: Set<number>;
  watches: Set<number>;
  // Sets are correct here: dynamic numeric membership with insert/delete,
  // not static string-keyed lookup tables.
  syncing: boolean;
  lastSyncError: string | null;
  bootstrap: () => Promise<void>;
  selectFestival: (f: Festival) => Promise<void>;
  sync: () => Promise<void>;
  toggleFavorite: (artistId: number) => void;
  toggleWatch: (slotId: number) => void;
};

export const useStore = create<StoreState>((set, get) => ({
  festival: null,
  festivals: [],
  cache: {
    layout: null,
    artists: [],
    stages: [],
    timetable: [],
    mapFloors: [],
    mapPoints: [],
    news: [],
    stampRallies: [],
  },
  userId: null,
  favorites: new Set<number>(),
  watches: new Set<number>(),
  syncing: false,
  lastSyncError: null,

  bootstrap: async () => {
    const userId = get().userId ?? (await ensureUserId());
    const festivals = await api.festivals();
    const festival = festivals[0] ?? null;
    const cache = await restoreCache();
    set({ userId, festivals, festival, cache });
    await get().sync();
  },

  selectFestival: async (f) => {
    set({ festival: f });
    await get().sync();
  },

  sync: async () => {
    const { festival, cache, syncing } = get();
    if (!festival || syncing) return;
    set({ syncing: true, lastSyncError: null });
    try {
      const result = await syncAll(festival.id, cache);
      set({ cache: result.cache });
      await flushQueue(festival.id); // replay offline mutations once online
    } catch (e) {
      set({ lastSyncError: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ syncing: false });
    }
  },

  toggleFavorite: (artistId) => {
    const { festival, userId, favorites } = get();
    if (!festival || !userId) return;
    const next = new Set(favorites);
    if (next.has(artistId)) next.delete(artistId);
    else next.add(artistId);
    set({ favorites: next });
    // Fire-and-forget; enqueued when offline and replayed by flushQueue.
    void (async () => {
      try {
        await api.setFavorites(festival.id, userId, [...next]);
      } catch {
        await enqueue({ kind: 'favorite', payload: { user_id: userId, artists: [...next] } });
      }
    })();
  },

  toggleWatch: (slotId) => {
    const { festival, userId, watches } = get();
    if (!festival || !userId) return;
    const next = new Set(watches);
    if (next.has(slotId)) next.delete(slotId);
    else next.add(slotId);
    set({ watches: next });
    void (async () => {
      try {
        await api.setWatches(festival.id, userId, [...next]);
      } catch {
        await enqueue({ kind: 'watch', payload: { user_id: userId, slots: [...next] } });
      }
    })();
  },
}));
