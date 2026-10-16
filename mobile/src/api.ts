// API client — mirrors fes-api surface. Base URL configurable for dev.
import Constants from 'expo-constants';

function resolveBaseUrl(): string {
  const extra: unknown = Constants.expoConfig?.extra;
  if (extra && typeof extra === 'object' && 'apiUrl' in extra) {
    const apiUrl: unknown = extra.apiUrl;
    if (typeof apiUrl === 'string' && apiUrl.length > 0) return apiUrl;
  }
  return 'http://10.0.2.2:8080';
}

const BASE_URL: string = resolveBaseUrl();

export type Festival = {
  id: string;
  name: string;
  app_name: string;
  start_at: string;
  end_at: string;
  image?: string;
  is_cancelled: boolean;
};

export type AppLayout = {
  festival_id: string;
  primary_color: string;
  button_color: string;
  status_bar_color: string;
  logo?: string;
  title_color: string;
  tabs?: { name: string; screen: string; ordering: number; icon?: string; active_icon?: string }[];
  home_buttons?: { name: string; icon: string; ordering: number; destination: string }[];
};

export type Artist = {
  id: number;
  name: string;
  display_name?: string;
  image?: string;
  description?: string;
  spotify_id?: string;
  youtube_id?: string;
  twitter_url?: string;
  instagram_url?: string;
  official_site?: string;
  ordering: number;
  hide_from_lineup?: boolean;
};

export type Stage = {
  id: number;
  name: string;
  color_code: string;
  bg_color_code?: string;
  ordering: number;
};

export type TimetableSlot = {
  id: number;
  stage_id: number;
  performance_date: string;
  start_at: string;
  end_at?: string;
  artist_ids: number[];
  title?: string;
  is_cancelled: boolean;
};

export type MapFloor = {
  id: number;
  name: string;
  map_image: string;
  image_width?: number;
  image_height?: number;
  ordering: number;
  is_default: boolean;
};

export type MapPoint = {
  id: number;
  floor_id: number | null;
  point_type: string;
  name: string;
  description?: string;
  location_x?: number;
  location_y?: number;
  latitude?: number;
  longitude?: number;
  category?: string;
  ordering: number;
};

export type NewsItem = {
  id: number;
  kind: 'news' | 'flash_report';
  title: string;
  body_html?: string;
  link?: string;
  image?: string;
  publish_at?: string;
};

export type StampRally = {
  id: number;
  name: string;
  explanation?: string;
  complete_message?: string;
  background_color?: string;
  prize_password?: string;
  points: { id: number; name: string; qr_token: string; ordering: number }[];
};

export type Revisions = Record<string, number>;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path}: ${res.status}`);
  return res.json();
}

export const api = {
  baseUrl: BASE_URL,
  festivals: () => get<Festival[]>('/v1/festivals'),
  layout: (fid: string) => get<AppLayout>(`/v1/festivals/${fid}/app_layout`),
  revisions: (fid: string) => get<Revisions>(`/v1/festivals/${fid}/revisions`),
  content: <T>(fid: string, entity: string, since: number) =>
    get<{ revision: number; items: T }>(`/v1/festivals/${fid}/content/${entity}?since=${since}`),
  setWatches: (fid: string, userId: string, slots: number[]) =>
    post(`/v1/festivals/${fid}/watch`, { user_id: userId, slots }),
  setFavorites: (fid: string, userId: string, artists: number[]) =>
    post(`/v1/festivals/${fid}/favorites`, { user_id: userId, artists }),
  stampCheckin: (userId: string, qrToken: string) =>
    post<{ ok: boolean; done: number; total: number; rally_complete: boolean; prize_password?: string }>(
      '/v1/stamp/checkin',
      { user_id: userId, qr_token: qrToken },
    ),
  stampStatus: (userId: string, fid: string) =>
    get<{ id: number; rally_id: number; name: string; checked_in: boolean }[]>(
      `/v1/stamp/status?user_id=${userId}&festival_id=${fid}`,
    ),
  registerPush: (token: string, userId: string, festivalId: string, platform: string) =>
    post('/v1/push/register', { token, user_id: userId, festival_id: festivalId, platform }),
};
