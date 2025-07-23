package utils

import (
	"cugrader/connection/db"
	"database/sql"
	"fmt"
)

func GetOrInsertGroupID(classID int, groupName string) (int, error) {
	var groupID int
	err := db.YSQL.QueryRow(`
		SELECT id FROM "group" WHERE class_id = $1 AND group_name = $2
	`, classID, groupName).Scan(&groupID)

	if err == sql.ErrNoRows {
		err = db.YSQL.QueryRow(`
			INSERT INTO "group" (class_id, group_name)
			VALUES ($1, $2)
			RETURNING id
		`, classID, groupName).Scan(&groupID)
		if err != nil {
			return 0, fmt.Errorf("failed to insert group: %w", err)
		}
	} else if err != nil {
		return 0, fmt.Errorf("failed to query group: %w", err)
	}

	return groupID, nil
}
