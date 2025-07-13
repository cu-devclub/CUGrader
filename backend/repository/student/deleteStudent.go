package student

import "cugrader/connection/db"

func Delete(classID int, userID int) error {
	query := `
		DELETE FROM class_student
		WHERE class_id = $1 AND user_id = $2
	`
	_, err := db.YSQL.Exec(query, classID, userID)
	return err
}
