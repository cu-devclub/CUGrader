package utils

import (
	"cugrader/connection/db"
	"fmt"
)

func ClassIDExists(id int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM class WHERE id = $1)`
	err := db.YSQL.QueryRow(query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking class id: %w", err)
	}
	return exists, nil
}

func LabIDExists(id int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM lab WHERE id = $1)`
	err := db.YSQL.QueryRow(query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking lab id: %w", err)
	}
	return exists, nil
}

func QuestionIdExists(id int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM question WHERE id = $1)`
	err := db.YSQL.QueryRow(query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking question id: %w", err)
	}
	return exists, nil
}

func SubmissionIdExists(id int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM submission WHERE id = $1)`
	err := db.YSQL.QueryRow(query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking submission id: %w", err)
	}
	return exists, nil
}
