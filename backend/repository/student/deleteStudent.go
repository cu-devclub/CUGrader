package student

import "cugrader/connection/db"

func Delete(StudentID int) error {
	query := `
		DELETE FROM class_student
		WHERE id = $1
	`
	_, err := db.YSQL.Exec(query, StudentID)
	return err
}
