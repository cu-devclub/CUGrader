package class

import "database/sql"

type ClassModel struct {
	DB *sql.DB
}

type SemesterModel struct {
	DB *sql.DB

	Year     int
	Semester int
}

type ClassObjectModel struct {
	DB *sql.DB

	ClassID    int    `json:"class_id"`
	CourseID   int    `json:"course_id"`
	CourseName string `json:"course_name"`
	Image      string `json:"image"`
}
