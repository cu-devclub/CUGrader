package student

import (
	"cugrader/connection/db"
	"fmt"
)

func Add(classID int, Email int, sectionID int, groupID *int) error {
	var userID int
	err := db.YSQL.QueryRow(`SELECT id FROM "user" WHERE email = $1`, Email).Scan(&userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	query := `
		INSERT INTO class_student (class_id, user_id, section_id, group_id)
		VALUES ($1, $2, $3, $4)
	`
	_, err = db.YSQL.Exec(query, classID, userID, sectionID, groupID)
	return err
}
