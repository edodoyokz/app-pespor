-- pespor festival platform — schema derived from FRF'26 app (eplus fes-api) room schema.
-- Multi-festival: every content table carries festival_id (venue_identifier equivalent).

CREATE TABLE festivals (
    id            TEXT PRIMARY KEY,          -- slug e.g. 'pespor-26'
    name          TEXT NOT NULL,
    app_name      TEXT NOT NULL DEFAULT '',
    start_at      TIMESTAMPTZ NOT NULL,
    end_at        TIMESTAMPTZ NOT NULL,
    image         TEXT,
    web_url       TEXT,
    purchase_url  TEXT,
    twitter_hashtag TEXT,
    is_cancelled  BOOLEAN NOT NULL DEFAULT FALSE,
    extra_info    JSONB NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revision-based delta sync: one row per (festival, entity).
-- Client compares revision numbers; fetches only entities whose revision changed.
CREATE TABLE revisions (
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    entity      TEXT NOT NULL,               -- 'app_layout','artist','stage','timetable','map','news','stamp_rally'
    revision    BIGINT NOT NULL DEFAULT 1,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (festival_id, entity)
);

-- App layout (CMS shell): theme + bottom tabs + home buttons per festival.
CREATE TABLE app_layout (
    festival_id    TEXT PRIMARY KEY REFERENCES festivals(id) ON DELETE CASCADE,
    primary_color  TEXT NOT NULL DEFAULT '#e64219',
    button_color   TEXT NOT NULL DEFAULT '#e64219',
    status_bar_color TEXT NOT NULL DEFAULT '#000000',
    background_image TEXT,
    logo           TEXT,
    title_color    TEXT NOT NULL DEFAULT '#ffffff',
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app_tabs (
    id          SERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,               -- display name
    screen      TEXT NOT NULL,               -- home|map|timetable|lineup|news|stamp|web_view
    ordering    INTEGER NOT NULL,
    icon_url    TEXT,
    active_icon_url TEXT
);

CREATE TABLE home_buttons (
    id          SERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    icon_url    TEXT NOT NULL,
    ordering    INTEGER NOT NULL,
    destination TEXT NOT NULL               -- screen alias or https URL
);

-- Lineup ----------------------------------------------------------------
CREATE TABLE artists (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    display_name TEXT,
    furigana    TEXT,                        -- for kana sorting (keep for i18n sorting keys)
    image       TEXT,
    description TEXT,
    spotify_id  TEXT,
    youtube_id  TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    official_site TEXT,
    ordering    INTEGER NOT NULL DEFAULT 0,
    hide_from_lineup BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_artists_festival ON artists(festival_id);

CREATE TABLE stages (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    color_code  TEXT NOT NULL DEFAULT '#888888',
    bg_color_code TEXT,
    image       TEXT,
    description TEXT,
    ordering    INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stages_festival ON stages(festival_id);

CREATE TABLE timetable_slots (
    id            BIGSERIAL PRIMARY KEY,
    festival_id   TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    stage_id      BIGINT NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    performance_date DATE NOT NULL,
    start_at      TIMESTAMPTZ NOT NULL,     -- resolved from date+hour+min
    end_at        TIMESTAMPTZ,              -- start + lifetime_minute
    artist_ids    BIGINT[] NOT NULL DEFAULT '{}',  -- slot may host multiple artists
    title         TEXT,                     -- override label (e.g. 'ROOKIE A GO-GO')
    is_cancelled  BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_timetable_festival_date ON timetable_slots(festival_id, performance_date);
CREATE INDEX idx_timetable_stage ON timetable_slots(stage_id);

-- User data (anonymous device-scoped or auth-scoped) --------------------
CREATE TABLE user_favorites (
    user_id    TEXT NOT NULL,               -- device id or account id
    festival_id TEXT NOT NULL,
    artist_id  BIGINT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, artist_id)
);

CREATE TABLE user_watches (
    user_id    TEXT NOT NULL,
    slot_id    BIGINT NOT NULL REFERENCES timetable_slots(id) ON DELETE CASCADE,
    festival_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, slot_id)
);

-- Map -------------------------------------------------------------------
-- Two render modes like the original: static floor images with x/y pins,
-- or external tile/vector map (map_provider = 'mapbox' with coordinates).
CREATE TABLE map_floors (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    map_image   TEXT NOT NULL,
    image_width  INTEGER,
    image_height INTEGER,
    ordering    INTEGER NOT NULL DEFAULT 0,
    rotate_degree REAL DEFAULT 0,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    background_color TEXT
);
CREATE INDEX idx_floors_festival ON map_floors(festival_id);

CREATE TABLE map_points (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    floor_id    BIGINT REFERENCES map_floors(id) ON DELETE CASCADE,  -- null = geocoords (mapbox mode)
    point_type  TEXT NOT NULL,              -- stage|food|shop|custom|first_aid|water|toilet
    name        TEXT NOT NULL,
    description TEXT,
    image       TEXT,
    category    TEXT,                        -- free-form filter category
    -- static-image coords (pixel space of floor image)
    location_x  REAL,
    location_y  REAL,
    -- geocoords (mapbox mode)
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    ordering    INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_coords CHECK (
        (floor_id IS NOT NULL AND location_x IS NOT NULL AND location_y IS NOT NULL)
        OR (floor_id IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL)
    )
);
CREATE INDEX idx_points_festival ON map_points(festival_id);

-- Congestion (live; pushed via silent push) ------------------------------
CREATE TABLE congestion_points (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    map_point_id BIGINT REFERENCES map_points(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    levels      JSONB NOT NULL DEFAULT '[]', -- [{level:1,color:'#4caf50',label:'空いてる'},...]
    current_level INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- News / flash report ----------------------------------------------------
CREATE TABLE news (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL DEFAULT 'news', -- news|flash_report
    title       TEXT NOT NULL,
    body_html   TEXT,
    link        TEXT,
    image       TEXT,
    tags        TEXT[] NOT NULL DEFAULT '{}',
    publish_at  TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_festival ON news(festival_id, kind);

-- Stamp rally -------------------------------------------------------------
CREATE TABLE stamp_rallies (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    explanation TEXT,
    complete_message TEXT,
    background_color TEXT,
    line_color  TEXT,
    start_at    TIMESTAMPTZ,
    finish_at   TIMESTAMPTZ,
    prize_password TEXT,                   -- shown when rally complete; user claims prize
    is_valid    BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stamp_points (
    id            BIGSERIAL PRIMARY KEY,
    rally_id      BIGINT NOT NULL REFERENCES stamp_rallies(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    explanation   TEXT,
    image         TEXT,
    qr_token      TEXT NOT NULL UNIQUE,    -- printed/encoded in venue QR; app scans this
    ordering      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE stamp_checkins (
    user_id     TEXT NOT NULL,
    point_id    BIGINT NOT NULL REFERENCES stamp_points(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_from_offline BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, point_id)
);

-- Push registration (FCM tokens) ------------------------------------------
CREATE TABLE push_tokens (
    token       TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    festival_id TEXT NOT NULL,
    platform    TEXT NOT NULL DEFAULT 'android',  -- android|ios
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit for CMS mutations (bump revisions) ---------------------------------
CREATE TABLE revision_log (
    id          BIGSERIAL PRIMARY KEY,
    festival_id TEXT NOT NULL,
    entity      TEXT NOT NULL,
    old_revision BIGINT,
    new_revision BIGINT NOT NULL,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
