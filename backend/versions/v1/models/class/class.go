package class

import "database/sql"

type ClassModel struct {
	DB *sql.DB
}

type SemesterModel struct {
	Year     int
	Semester int
}

type ClassObjectModel struct {
	ClassID    int    `json:"class_id"`
	CourseID   int    `json:"course_id"`
	CourseName string `json:"course_name"`
	Image      int    `json:"picture_id"`
}
