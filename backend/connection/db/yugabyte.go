package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var YSQL *sql.DB

func InitYugabyte(dsn string) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Yugabyte connection error: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("Yugabyte ping failed: %v", err)
	}

	YSQL = db
}
