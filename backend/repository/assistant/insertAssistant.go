package assistant

import "cugrader/connection/db"

func Insert(classID int, UserId int) error {
	query := `
		INSERT INTO class_assistant (class_id, user_id, is_leader)
		VALUES ($1, $2, TRUE)
		ON CONFLICT DO NOTHING`
	_, err := db.YSQL.Exec(query, classID, UserId)
	return err
}
