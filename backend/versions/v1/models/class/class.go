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
