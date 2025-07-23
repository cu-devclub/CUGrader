package utils

import (
	"cugrader/connection/db"
	"database/sql"
	"fmt"
)

func GetOrInsertSectionID(classID int, sectionNumber int) (int, error) {
	var sectionID int
	err := db.YSQL.QueryRow(`
		SELECT id FROM section WHERE class_id = $1 AND section_number = $2
	`, classID, sectionNumber).Scan(&sectionID)

	if err == sql.ErrNoRows {
		err = db.YSQL.QueryRow(`
			INSERT INTO section (class_id, section_number)
			VALUES ($1, $2)
			RETURNING id
		`, classID, sectionNumber).Scan(&sectionID)
		if err != nil {
			return 0, fmt.Errorf("failed to insert section: %w", err)
		}
	} else if err != nil {
		return 0, fmt.Errorf("failed to query section: %w", err)
	}

	return sectionID, nil
}
