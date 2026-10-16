// Package api defines the HTTP surface mirroring the eplus fes-api concept:
// app layout, revision sync, content fetch, stamp check-in, watch/favorite sync.
package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"

	"pespor/backend/internal/push"
	"pespor/backend/internal/sync"
)

type Server struct {
	db      *pgxpool.Pool
	pusher  *push.Sender
}

func New(db *pgxpool.Pool, pusher *push.Sender) http.Handler {
	mux := http.NewServeMux()
	s := &Server{db: db, pusher: pusher}

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200) })

	// GET /v1/festivals — list festivals
	mux.HandleFunc("GET /v1/festivals", s.listFestivals)
	// GET /v1/festivals/{id}/app_layout — CMS shell config
	mux.HandleFunc("GET /v1/festivals/{id}/app_layout", s.appLayout)
	// GET /v1/festivals/{id}/revisions — {entity: revision} map for delta sync
	mux.HandleFunc("GET /v1/festivals/{id}/revisions", s.revisions)
	// GET /v1/festivals/{id}/content/{entity}?since=<rev> — delta fetch
	mux.HandleFunc("GET /v1/festivals/{id}/content/{entity}", s.content)
	// POST /v1/festivals/{id}/watch — bulk upsert watch state {user_id, slots:[ids]}
	mux.HandleFunc("POST /v1/festivals/{id}/watch", s.setWatches)
	// POST /v1/festivals/{id}/favorites — bulk upsert favorites {user_id, artists:[ids]}
	mux.HandleFunc("POST /v1/festivals/{id}/favorites", s.setFavorites)
	// POST /v1/stamp/checkin — {user_id, rally_id, qr_token} idempotent check-in
	mux.HandleFunc("POST /v1/stamp/checkin", s.stampCheckin)
	// GET /v1/stamp/status?user_id=&festival_id= — checked-in points
	mux.HandleFunc("GET /v1/stamp/status", s.stampStatus)
	// POST /v1/push/register — FCM token registration
	mux.HandleFunc("POST /v1/push/register", s.registerPush)

	// Admin: POST /admin/festivals/{id}/push — broadcast silent push
	mux.HandleFunc("POST /admin/festivals/{id}/push", s.pusher.AdminHandler())

	return logMiddleware(mux)
}

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func pathSeg(r *http.Request, i int) string {
	segs := segmentPath(r.URL.Path)
	if i < len(segs) {
		return segs[i]
	}
	return ""
}

func segmentPath(p string) []string {
	var out []string
	cur := ""
	for _, c := range p {
		if c == '/' {
			if cur != "" {
				out = append(out, cur)
			}
			cur = ""
			continue
		}
		cur += string(c)
	}
	if cur != "" {
		out = append(out, cur)
	}
	return out
}

func atoi(s string) int64 {
	v, _ := strconv.ParseInt(s, 10, 64)
	return v
}

var _ = sync.BumpRevision // keep import until used in admin handlers
