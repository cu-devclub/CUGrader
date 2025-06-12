package student

import "database/sql"

type StudentModel struct {
	DB *sql.DB
}

type StudentInfo struct {
	UserID    int    `json:"user_id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Picture   string `json:"picture"`
	StudentID string `json:"student_id"`
	Withdrawn bool   `json:"withdrawn"`
	MaxScore  int    `json:"max_score"`
}
