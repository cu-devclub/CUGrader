package language

import "database/sql"

type LanguageModel struct {
	DB *sql.DB
}

type Language struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}