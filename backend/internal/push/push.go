// Package push sends FCM data-only ("silent") messages that tell clients
// to re-check revisions or react to live changes (cancel, congestion).
// Mirrors the original app's SilentPushManager contract:
//   {type: "refresh", entity: "timetable"}          → client re-syncs that entity
//   {type: "cancel",  slot_id: 123}                 → cancel alert + UI flag
//   {type: "congestion", point_id: 4, level: 2}     → live congestion update
package push

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Sender struct {
	db    *pgxpool.Pool
	app   *firebase.App
	addrc string // FCM credentials JSON path, empty = dry run
}

// New initializes FCM when credentialsPath is non-empty; otherwise Sender
// logs messages (dry run) so local dev works without service accounts.
func New(ctx context.Context, db *pgxpool.Pool, credentialsPath string) (*Sender, error) {
	s := &Sender{db: db, addrc: credentialsPath}
	if credentialsPath == "" {
		return s, nil
	}
	app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile(credentialsPath))
	if err != nil {
		return nil, err
	}
	s.app = app
	return s, nil
}

// Data payload sent as FCM data message. Client routes on "type".
type SilentMessage struct {
	Type    string `json:"type"`              // refresh|cancel|congestion
	Entity  string `json:"entity,omitempty"`  // for refresh: revision entity name
	SlotID  int64  `json:"slot_id,omitempty"` // for cancel
	PointID int64  `json:"point_id,omitempty"`
	Level   int    `json:"level,omitempty"`
}

// Broadcast sends msg to every registered device of a festival.
func (s *Sender) Broadcast(ctx context.Context, festivalID string, msg SilentMessage) error {
	rows, err := s.db.Query(ctx, `SELECT token FROM push_tokens WHERE festival_id=$1`, festivalID)
	if err != nil {
		return err
	}
	defer rows.Close()
	var tokens []string
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err != nil {
			return err
		}
		tokens = append(tokens, t)
	}
	if len(tokens) == 0 {
		log.Printf("push: no tokens registered for %s; message=%+v", festivalID, msg)
		return nil
	}
	payload, _ := json.Marshal(msg)
	data := map[string]string{"data": string(payload)}

	if s.app == nil {
		log.Printf("push[DRY]: %d devices, payload=%s", len(tokens), payload)
		return nil
	}
	client, err := s.app.Messaging(ctx)
	if err != nil {
		return err
	}
	// FCM batch limit is 500; chunk.
	for i := 0; i < len(tokens); i += 500 {
		end := min(i+500, len(tokens))
		resp, err := client.SendEachForMulticast(ctx, &messaging.MulticastMessage{
			Tokens: tokens[i:end],
			Data:   data,
		})
		if err != nil {
			return err
		}
		if resp.FailureCount > 0 {
			log.Printf("push: %d/%d failures", resp.FailureCount, len(tokens[i:end]))
		}
	}
	return nil
}

// AdminHandler POST /admin/festivals/{id}/push — protected by header token in production.
func (s *Sender) AdminHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fid := r.PathValue("id")
		var msg SilentMessage
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil || msg.Type == "" {
			http.Error(w, `{"error":"invalid body"}`, 400)
			return
		}
		if err := s.Broadcast(r.Context(), fid, msg); err != nil {
			http.Error(w, fmt.Sprintf(`{"error":%q}`, err.Error()), 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
