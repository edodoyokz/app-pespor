package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"pespor/backend/internal/sync"
)

// setWatches POST /v1/festivals/{id}/watch {user_id, slots:[...]}
func (s *Server) setWatches(w http.ResponseWriter, r *http.Request) {
	fid := pathSeg(r, 2)
	var body struct {
		UserID string  `json:"user_id"`
		Slots  []int64 `json:"slots"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == "" {
		writeErr(w, 400, "invalid body")
		return
	}
	ctx := r.Context()
	tx, err := s.db.Begin(ctx)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer tx.Rollback(ctx)
	if _, err := tx.Exec(ctx, `DELETE FROM user_watches WHERE user_id=$1 AND festival_id=$2`, body.UserID, fid); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	for _, slot := range body.Slots {
		if _, err := tx.Exec(ctx, `INSERT INTO user_watches(user_id, slot_id, festival_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, body.UserID, slot, fid); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
	}
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, map[string]bool{"ok": true})
}

// setFavorites POST /v1/festivals/{id}/favorites {user_id, artists:[...]}
func (s *Server) setFavorites(w http.ResponseWriter, r *http.Request) {
	fid := pathSeg(r, 2)
	var body struct {
		UserID  string  `json:"user_id"`
		Artists []int64 `json:"artists"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == "" {
		writeErr(w, 400, "invalid body")
		return
	}
	ctx := r.Context()
	tx, err := s.db.Begin(ctx)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer tx.Rollback(ctx)
	if _, err := tx.Exec(ctx, `DELETE FROM user_favorites WHERE user_id=$1 AND festival_id=$2`, body.UserID, fid); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	for _, aid := range body.Artists {
		if _, err := tx.Exec(ctx, `INSERT INTO user_favorites(user_id, artist_id, festival_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, body.UserID, aid, fid); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
	}
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, map[string]bool{"ok": true})
}

// stampCheckin POST /v1/stamp/checkin {user_id, qr_token}
// Idempotent: re-checkin same point returns ok without duplicate.
func (s *Server) stampCheckin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserID  string `json:"user_id"`
		QRToken string `json:"qr_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == "" || body.QRToken == "" {
		writeErr(w, 400, "invalid body")
		return
	}
	ctx := r.Context()
	var pointID int64
	var rallyID int64
	err := s.db.QueryRow(ctx, `
		SELECT sp.id, sp.rally_id FROM stamp_points sp
		JOIN stamp_rallies sr ON sr.id = sp.rally_id
		WHERE sp.qr_token=$1 AND sr.is_valid`, body.QRToken).Scan(&pointID, &rallyID)
	if err != nil {
		writeErr(w, 404, "invalid qr token")
		return
	}
	if _, err := s.db.Exec(ctx, `
		INSERT INTO stamp_checkins(user_id, point_id) VALUES($1,$2)
		ON CONFLICT (user_id, point_id) DO NOTHING`, body.UserID, pointID); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	var total, done int
	s.db.QueryRow(ctx, `SELECT COUNT(*) FROM stamp_points WHERE rally_id=$1`, rallyID).Scan(&total)
	s.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM stamp_checkins c JOIN stamp_points p ON p.id=c.point_id
		WHERE c.user_id=$1 AND p.rally_id=$2`, body.UserID, rallyID).Scan(&done)

	complete := total > 0 && done >= total
	var prizePassword string
	if complete {
		s.db.QueryRow(ctx, `SELECT COALESCE(prize_password,'') FROM stamp_rallies WHERE id=$1`, rallyID).Scan(&prizePassword)
	}
	writeJSON(w, map[string]any{
		"ok":             true,
		"point_id":       pointID,
		"rally_id":       rallyID,
		"done":           done,
		"total":          total,
		"rally_complete": complete,
		"prize_password": prizePassword,
	})
}

// stampStatus GET /v1/stamp/status?user_id=&festival_id=
func (s *Server) stampStatus(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query().Get("user_id")
	fid := r.URL.Query().Get("festival_id")
	if uid == "" || fid == "" {
		writeErr(w, 400, "user_id and festival_id required")
		return
	}
	rows, err := s.db.Query(r.Context(), `
		SELECT sp.id, sp.rally_id, sp.name, c.checked_in_at IS NOT NULL
		FROM stamp_points sp
		JOIN stamp_rallies sr ON sr.id=sp.rally_id
		LEFT JOIN stamp_checkins c ON c.point_id=sp.id AND c.user_id=$1
		WHERE sr.festival_id=$2 AND sr.is_valid
		ORDER BY sr.id, sp.ordering`, uid, fid)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer rows.Close()
	type P struct {
		ID        int64  `json:"id"`
		RallyID   int64  `json:"rally_id"`
		Name      string `json:"name"`
		CheckedIn bool   `json:"checked_in"`
	}
	out := []P{}
	for rows.Next() {
		var p P
		if err := rows.Scan(&p.ID, &p.RallyID, &p.Name, &p.CheckedIn); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		out = append(out, p)
	}
	writeJSON(w, out)
}

// registerPush POST /v1/push/register {token, user_id, festival_id, platform}
func (s *Server) registerPush(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token      string `json:"token"`
		UserID     string `json:"user_id"`
		FestivalID string `json:"festival_id"`
		Platform   string `json:"platform"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Token == "" || body.UserID == "" {
		writeErr(w, 400, "invalid body")
		return
	}
	if body.Platform == "" {
		body.Platform = "android"
	}
	if _, err := s.db.Exec(r.Context(), `
		INSERT INTO push_tokens(token, user_id, festival_id, platform) VALUES($1,$2,$3,$4)
		ON CONFLICT (token) DO UPDATE SET user_id=EXCLUDED.user_id, festival_id=EXCLUDED.festival_id`,
		body.Token, body.UserID, body.FestivalID, strings.ToLower(body.Platform)); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, map[string]bool{"ok": true})
}

var _ = sync.BumpRevision
