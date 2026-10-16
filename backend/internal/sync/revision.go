// Package sync bumps per-entity revisions after CMS content changes.
// Clients poll GET /revisions and fetch only entities whose revision advanced.
package sync

import (
	"context"
)

// BumpRevision increments the revision counter for (festival, entity) inside tx.
// Call after any content mutation so clients detect the delta.
func BumpRevision(ctx context.Context, tx interface {
	Exec(ctx context.Context, sql string, args ...any) (interface{ RowsAffected() int64 }, error)
}, festivalID, entity string) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO revisions(festival_id, entity, revision) VALUES($1,$2,2)
		ON CONFLICT (festival_id, entity) DO UPDATE SET revision = revisions.revision + 1, updated_at = now()`,
		festivalID, entity)
	return err
}
