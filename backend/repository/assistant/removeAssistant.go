package assistant

import "cugrader/connection/db"

func Remove(classID int, email string) error {
	query := `DELETE FROM assistant WHERE class_id = $1 AND email = $2`
	_, err := db.YSQL.Exec(query, classID, email)
	return err
}
