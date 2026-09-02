package utils

import (
	"cugrader/connection/db"
	"fmt"
)

func GetClassIDWithAssistantId(id int) (int, error) {
	var ClassID int
	err := db.YSQL.QueryRow(`SELECT class_id FROM "class_assistant" WHERE id = $1`, id).Scan(&ClassID)
	if err != nil {
		return 0, fmt.Errorf("assistant not found: %w", err)
	}
	return ClassID, nil
}

func GetClassIDWithStudentId(id int) (int, error) {
	var ClassID int
	err := db.YSQL.QueryRow(`SELECT class_id FROM "class_student" WHERE id = $1`, id).Scan(&ClassID)
	if err != nil {
		return 0, fmt.Errorf("user not found: %w", err)
	}
	return ClassID, nil
}

func GetClassIDWithLabId(id int) (int, error) {
	var ClassID int
	err := db.YSQL.QueryRow(`SELECT class_id FROM "lab" WHERE id = $1`, id).Scan(&ClassID)
	if err != nil {
		return 0, fmt.Errorf("lab not found: %w", err)
	}
	return ClassID, nil
}
