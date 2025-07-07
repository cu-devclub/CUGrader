package exampin

import "database/sql"

type ExamPin struct {
	ExamPin string
}

type PinModel struct {
	DB *sql.DB
}
