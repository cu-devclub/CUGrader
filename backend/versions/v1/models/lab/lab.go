package lab

import (
	"database/sql"
	"time"
)

type LabModel struct {
	DB *sql.DB
}

type LabResponse struct {
	LabID     int       `json:"lab_id"`
	LabNumber int       `json:"lab_number"`
	LabName   string    `json:"lab_name"`
	Publish   time.Time `json:"publish"`
	Due       time.Time `json:"due"`
	Score     int       `json:"score"` // เซ็ตเป็น 0 ชั่วคราว
	MaxScore  int       `json:"max_score"`
	Status    string    `json:"status"`
}
