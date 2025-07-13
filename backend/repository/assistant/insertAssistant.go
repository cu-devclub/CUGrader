package assistant

import "cugrader/connection/db"

func Insert(classID int, email string) error {
	query := `
		INSERT INTO assistant (class_id, email)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`
	_, err := db.YSQL.Exec(query, classID, email)
	return err
}
