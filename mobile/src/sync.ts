// Revision-based sync engine + SQLite-less persistence via AsyncStorage.
// Contract mirrors the original app:
//  1. GET /revisions → {entity: rev}
//  2. For each entity where stored rev < server rev → GET /content/{entity}?since=<stored>
//  3. Merge into cache, store new rev.
// All reads synchronous from state; writes persist JSON per entity.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, type Artist, type AppLayout, type MapFloor, type MapPoint, type NewsItem, type Revisions, type Stage, type StampRally, type TimetableSlot } from './api';

const KEY_REV = 'rev';
const KEY_ENT = (e: string) => `ent:${e}`;

export type ContentCache = {
  layout: AppLayout | null;
  artists: Artist[];
  stages: Stage[];
  timetable: TimetableSlot[];
  mapFloors: MapFloor[];
  mapPoints: MapPoint[];
  news: NewsItem[];
  stampRallies: StampRally[];
};

const emptyCache: ContentCache = {
  layout: null,
  artists: [],
  stages: [],
  timetable: [],
  mapFloors: [],
  mapPoints: [],
  news: [],
  stampRallies: [],
};

async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// syncAll pulls deltas for every entity. Returns full cache after merge.
export async function syncAll(festivalId: string, prev: ContentCache): Promise<{ cache: ContentCache; revisions: Revisions }> {
  const stored = await loadJSON<Revisions>(KEY_REV, {});
  const server = await api.revisions(festivalId);

  const cache: ContentCache = { ...prev };
  const nextRev: Revisions = { ...stored };

  // layout is revision-tracked too but delivered via app_layout endpoint
  if ((server['app_layout'] ?? 0) !== (stored['app_layout'] ?? -1)) {
    cache.layout = await api.layout(festivalId);
    nextRev['app_layout'] = server['app_layout'] ?? 0;
    await AsyncStorage.setItem(KEY_ENT('layout'), JSON.stringify(cache.layout));
  }

  const pull = async <T>(entity: string, merge: (items: T[]) => void) => {
    const have = stored[entity] ?? 0;
    const want = server[entity] ?? 0;
    if (want <= have) return;
    const { revision, items } = await api.content<T[]>(festivalId, entity, have);
    merge(items);
    nextRev[entity] = revision;
    await AsyncStorage.setItem(KEY_ENT(entity), JSON.stringify(items));
  };

  await pull<Artist>('artist', (items) => { cache.artists = items; });
  await pull<Stage>('stage', (items) => { cache.stages = items; });
  await pull<TimetableSlot>('timetable', (items) => { cache.timetable = items; });
  await pull<NewsItem>('news', (items) => { cache.news = items; });
  await pull<StampRally>('stamp_rally', (items) => { cache.stampRallies = items; });

  // map entity returns {floors, points}
  if ((server['map'] ?? 0) > (stored['map'] ?? 0)) {
    const { revision, items } = await api.content<{ floors: MapFloor[]; points: MapPoint[] }>(festivalId, 'map', stored['map'] ?? 0);
    cache.mapFloors = items.floors ?? [];
    cache.mapPoints = items.points ?? [];
    nextRev['map'] = revision;
    await AsyncStorage.setItem(KEY_ENT('map'), JSON.stringify(items));
  }

  await AsyncStorage.setItem(KEY_REV, JSON.stringify(nextRev));
  return { cache, revisions: nextRev };
}

// restoreCache loads persisted content at app start (offline-first boot).
export async function restoreCache(): Promise<ContentCache> {
  const cache = { ...emptyCache };
  cache.layout = await loadJSON<AppLayout | null>(KEY_ENT('layout'), null);
  cache.artists = await loadJSON<Artist[]>(KEY_ENT('artist'), []);
  cache.stages = await loadJSON<Stage[]>(KEY_ENT('stage'), []);
  cache.timetable = await loadJSON<TimetableSlot[]>(KEY_ENT('timetable'), []);
  const map = await loadJSON<{ floors: MapFloor[]; points: MapPoint[] } | null>(KEY_ENT('map'), null);
  if (map) {
    cache.mapFloors = map.floors ?? [];
    cache.mapPoints = map.points ?? [];
  }
  cache.news = await loadJSON<NewsItem[]>(KEY_ENT('news'), []);
  cache.stampRallies = await loadJSON<StampRally[]>(KEY_ENT('stamp_rally'), []);
  return cache;
}

// Offline mutation queue for watch/favorite/checkin actions.
type QueuedMutation = { kind: 'watch' | 'favorite' | 'checkin'; payload: Record<string, unknown> };
const KEY_QUEUE = 'mutation_queue';

export async function enqueue(mutation: QueuedMutation): Promise<void> {
  const q = await loadJSON<QueuedMutation[]>(KEY_QUEUE, []);
  q.push(mutation);
  await AsyncStorage.setItem(KEY_QUEUE, JSON.stringify(q));
}

export async function flushQueue(festivalId: string): Promise<number> {
  const q = await loadJSON<QueuedMutation[]>(KEY_QUEUE, []);
  if (q.length === 0) return 0;
  const remaining: QueuedMutation[] = [];
  for (const m of q) {
    try {
      if (m.kind === 'watch') {
        await api.setWatches(festivalId, String(m.payload.user_id), m.payload.slots as number[]);
      } else if (m.kind === 'favorite') {
        await api.setFavorites(festivalId, String(m.payload.user_id), m.payload.artists as number[]);
      } else if (m.kind === 'checkin') {
        await api.stampCheckin(String(m.payload.user_id), String(m.payload.qr_token));
      }
    } catch {
      remaining.push(m); // still offline — retry next flush
    }
  }
  await AsyncStorage.setItem(KEY_QUEUE, JSON.stringify(remaining));
  return q.length - remaining.length;
}
