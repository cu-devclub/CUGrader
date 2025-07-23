package assistant

import "cugrader/connection/db"

func Remove(Id int) error {
	query := `DELETE FROM class_assistant WHERE id = $1`
	_, err := db.YSQL.Exec(query, Id)
	return err
}
