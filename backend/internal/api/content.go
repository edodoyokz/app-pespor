package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// listFestivals GET /v1/festivals
func (s *Server) listFestivals(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `
		SELECT id, name, app_name, start_at, end_at, image, web_url, purchase_url, twitter_hashtag, is_cancelled
		FROM festivals ORDER BY start_at DESC`)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer rows.Close()
	type F struct {
		ID             string `json:"id"`
		Name           string `json:"name"`
		AppName        string `json:"app_name"`
		StartAt        string `json:"start_at"`
		EndAt          string `json:"end_at"`
		Image          string `json:"image,omitempty"`
		WebURL         string `json:"web_url,omitempty"`
		PurchaseURL    string `json:"purchase_url,omitempty"`
		TwitterHashtag string `json:"twitter_hashtag,omitempty"`
		IsCancelled    bool   `json:"is_cancelled"`
	}
	out := []F{}
	for rows.Next() {
		var f F
		var img, web, pur, hash *string
		var startAt, endAt time.Time
		if err := rows.Scan(&f.ID, &f.Name, &f.AppName, &startAt, &endAt, &img, &web, &pur, &hash, &f.IsCancelled); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		f.StartAt = startAt.Format(time.RFC3339)
		f.EndAt = endAt.Format(time.RFC3339)
		if img != nil {
			f.Image = *img
		}
		if web != nil {
			f.WebURL = *web
		}
		if pur != nil {
			f.PurchaseURL = *pur
		}
		if hash != nil {
			f.TwitterHashtag = *hash
		}
		out = append(out, f)
	}
	writeJSON(w, out)
}

// appLayout GET /v1/festivals/{id}/app_layout
func (s *Server) appLayout(w http.ResponseWriter, r *http.Request) {
	fid := pathSeg(r, 2)
	ctx := r.Context()
	var layout struct {
		FestivalID      string          `json:"festival_id"`
		PrimaryColor    string          `json:"primary_color"`
		ButtonColor     string          `json:"button_color"`
		StatusBarColor  string          `json:"status_bar_color"`
		BackgroundImage string          `json:"background_image,omitempty"`
		Logo            string          `json:"logo,omitempty"`
		TitleColor      string          `json:"title_color"`
		Tabs            []tabJSON       `json:"tabs"`
		HomeButtons     []homeButtonDTO `json:"home_buttons"`
	}
	err := s.db.QueryRow(ctx, `
		SELECT festival_id, primary_color, button_color, status_bar_color,
		       COALESCE(background_image,''), COALESCE(logo,''), title_color
		FROM app_layout WHERE festival_id=$1`, fid).
		Scan(&layout.FestivalID, &layout.PrimaryColor, &layout.ButtonColor, &layout.StatusBarColor,
			&layout.BackgroundImage, &layout.Logo, &layout.TitleColor)
	if err != nil {
		writeErr(w, 404, "layout not found")
		return
	}

	trows, err := s.db.Query(ctx, `SELECT name, screen, ordering, COALESCE(icon_url,''), COALESCE(active_icon_url,'') FROM app_tabs WHERE festival_id=$1 ORDER BY ordering`, fid)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer trows.Close()
	for trows.Next() {
		var t tabJSON
		if err := trows.Scan(&t.Name, &t.Screen, &t.Ordering, &t.Icon, &t.ActiveIcon); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		layout.Tabs = append(layout.Tabs, t)
	}

	brows, err := s.db.Query(ctx, `SELECT name, icon_url, ordering, destination FROM home_buttons WHERE festival_id=$1 ORDER BY ordering`, fid)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer brows.Close()
	for brows.Next() {
		var b homeButtonDTO
		if err := brows.Scan(&b.Name, &b.Icon, &b.Ordering, &b.Destination); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		layout.HomeButtons = append(layout.HomeButtons, b)
	}
	writeJSON(w, layout)
}

type tabJSON struct {
	Name       string `json:"name"`
	Screen     string `json:"screen"`
	Ordering   int    `json:"ordering"`
	Icon       string `json:"icon,omitempty"`
	ActiveIcon string `json:"active_icon,omitempty"`
}

type homeButtonDTO struct {
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	Ordering    int    `json:"ordering"`
	Destination string `json:"destination"`
}

// revisions GET /v1/festivals/{id}/revisions
func (s *Server) revisions(w http.ResponseWriter, r *http.Request) {
	fid := pathSeg(r, 2)
	rows, err := s.db.Query(r.Context(), `SELECT entity, revision FROM revisions WHERE festival_id=$1`, fid)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := map[string]int64{}
	for rows.Next() {
		var e string
		var rev int64
		if err := rows.Scan(&e, &rev); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		out[e] = rev
	}
	writeJSON(w, out)
}

// content GET /v1/festivals/{id}/content/{entity}?since=<rev>
// Delta fetch: returns rows with updated revision > since, plus current revision.
func (s *Server) content(w http.ResponseWriter, r *http.Request) {
	fid := pathSeg(r, 2)
	entity := pathSeg(r, 4)
	since := atoi(r.URL.Query().Get("since"))

	var currentRev int64
	err := s.db.QueryRow(r.Context(), `SELECT revision FROM revisions WHERE festival_id=$1 AND entity=$2`, fid, entity).Scan(&currentRev)
	if err != nil {
		writeErr(w, 404, "unknown entity")
		return
	}

	ctx := r.Context()
	var payload any
	switch entity {
	case "artist":
		payload, err = s.fetchArtists(ctx, fid, since)
	case "stage":
		payload, err = s.fetchStages(ctx, fid, since)
	case "timetable":
		payload, err = s.fetchTimetable(ctx, fid, since)
	case "map":
		payload, err = s.fetchMap(ctx, fid, since)
	case "news":
		payload, err = s.fetchNews(ctx, fid, since)
	case "stamp_rally":
		payload, err = s.fetchStampRallies(ctx, fid, since)
	default:
		writeErr(w, 404, "unknown entity")
		return
	}
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, map[string]any{"revision": currentRev, "items": payload})
}

// The entity fetchers scan full rows into generic maps — keeps this file small
// while the schema is young; typed structs can replace per-entity once stable.
func (s *Server) fetchArtists(ctx context.Context, fid string, since int64) (any, error) {
	rows, err := s.db.Query(ctx, `
		SELECT jsonb_agg(to_jsonb(a) ORDER BY a.ordering)
		FROM artists a JOIN revisions rv ON rv.festival_id=a.festival_id AND rv.entity='artist'
		WHERE a.festival_id=$1 AND rv.revision > $2`, fid, since)
	return scanJSONRows(rows, err)
}

func (s *Server) fetchStages(ctx context.Context, fid string, since int64) (any, error) {
	rows, err := s.db.Query(ctx, `
		SELECT jsonb_agg(to_jsonb(st) ORDER BY st.ordering)
		FROM stages st JOIN revisions rv ON rv.festival_id=st.festival_id AND rv.entity='stage'
		WHERE st.festival_id=$1 AND rv.revision > $2`, fid, since)
	return scanJSONRows(rows, err)
}

func (s *Server) fetchTimetable(ctx context.Context, fid string, since int64) (any, error) {
	rows, err := s.db.Query(ctx, `
		SELECT jsonb_agg(to_jsonb(t) ORDER BY t.start_at)
		FROM timetable_slots t JOIN revisions rv ON rv.festival_id=t.festival_id AND rv.entity='timetable'
		WHERE t.festival_id=$1 AND rv.revision > $2`, fid, since)
	return scanJSONRows(rows, err)
}

func (s *Server) fetchMap(ctx context.Context, fid string, since int64) (any, error) {
	floors, err := s.db.Query(ctx, `
		SELECT jsonb_agg(to_jsonb(f) ORDER BY f.ordering)
		FROM map_floors f JOIN revisions rv ON rv.festival_id=f.festival_id AND rv.entity='map'
		WHERE f.festival_id=$1 AND rv.revision > $2`, fid, since)
	if err != nil {
		return nil, err
	}
	floorItems, err := scanJSONRows(floors, err)
	if err != nil {
		return nil, err
	}
	points, err := s.db.Query(ctx, `
		SELECT jsonb_agg(to_jsonb(p) ORDER BY p.ordering)
		FROM map_points p JOIN revisions rv ON rv.festival_id=p.festival_id AND rv.entity='map'
		WHERE p.festival_id=$1 AND rv.revision > $2`, fid, since)
	if err != nil {
		return nil, err
	}
	pointItems, err := scanJSONRows(points, err)
	if err != nil {
		return nil, err
	}
	return map[string]any{"floors": floorItems, "points": pointItems}, nil
}

func (s *Server) fetchNews(ctx context.Context, fid string, since int64) (any, error) {
	rows, err := s.db.Query(ctx, `
		SELECT jsonb_agg(to_jsonb(n) ORDER BY n.publish_at DESC)
		FROM news n JOIN revisions rv ON rv.festival_id=n.festival_id AND rv.entity='news'
		WHERE n.festival_id=$1 AND rv.revision > $2`, fid, since)
	return scanJSONRows(rows, err)
}

func (s *Server) fetchStampRallies(ctx context.Context, fid string, since int64) (any, error) {
	rows, err := s.db.Query(ctx, `
		SELECT jsonb_agg(rally_json) FROM (
			SELECT to_jsonb(sr) || jsonb_build_object('points', (
				SELECT jsonb_agg(to_jsonb(sp) ORDER BY sp.ordering)
				FROM stamp_points sp WHERE sp.rally_id = sr.id
			)) AS rally_json
			FROM stamp_rallies sr
			JOIN revisions rv ON rv.festival_id=sr.festival_id AND rv.entity='stamp_rally'
			WHERE sr.festival_id=$1 AND rv.revision > $2
		) sub`, fid, since)
	return scanJSONRows(rows, err)
}

type jsonRow interface {
	Next() bool
	Scan(dest ...any) error
	Close()
}

func scanJSONRows(rows jsonRow, err error) (any, error) {
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	if !rows.Next() {
		return []any{}, nil
	}
	var raw []byte
	if err := rows.Scan(&raw); err != nil {
		return nil, err
	}
	if raw == nil {
		return []any{}, nil
	}
	var v any
	if err := json.Unmarshal(raw, &v); err != nil {
		return nil, err
	}
	return v, nil
}
