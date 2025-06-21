package nearduedate

import (
	"database/sql"
	"time"
)

type NearduedateModel struct {
	DB *sql.DB
}

type NearDueDate struct {
	CourseID    int       `json:"course_id"`
	CourseName  string    `json:"course_name"`
	LabID       int       `json:"lab_id"`
	LabName     string    `json:"lab_name"`
	LabDue      time.Time `json:"lab_due"`
	LabMaxScore int       `json:"lab_max_score"`
}
