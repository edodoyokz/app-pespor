package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"pespor/backend/internal/api"
	"pespor/backend/internal/push"
	"pespor/backend/internal/store"
)

func main() {
	dsn := env("DATABASE_URL", "postgres://pespor:pespor@localhost:5432/pespor?sslmode=disable")
	addr := env("ADDR", ":8080")

	ctx := context.Background()
	st, err := store.Open(ctx, dsn)
	if err != nil {
		log.Fatalf("store: %v", err)
	}
	defer st.Close()

	pusher, err := push.New(ctx, st, os.Getenv("FCM_CREDENTIALS"))
	if err != nil {
		log.Fatalf("push: %v", err)
	}

	if err := store.Migrate(ctx, st, "migrations"); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	if os.Getenv("SEED") == "1" {
		if err := store.Migrate(ctx, st, "seed"); err != nil { // same tracked-apply mechanism
			log.Fatalf("seed: %v", err)
		}
		log.Printf("seed applied")
	}

	srv := &http.Server{
		Addr:    addr,
		Handler: api.New(st, pusher),
	}
	log.Printf("pespor backend listening on %s", addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
