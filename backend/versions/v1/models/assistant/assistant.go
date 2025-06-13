package assistant

import "database/sql"

type AssistantModel struct {
	DB *sql.DB
}

type Info struct {
	UserID   int    `json:"user_id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	IsLeader bool   `json:"is_leader,omitempty"` // only assistant
}
