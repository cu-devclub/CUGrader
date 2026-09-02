package lab

import (
	"cugrader/connection/db"
	"database/sql"
)

func GetExaminationPin(labId int) (string, error) {

	var examPin *sql.NullString
	var examMode bool

	query := `SELECT
		exam_mode,
		exam_pin
	FROM lab
	WHERE id = $1`
	row := db.YSQL.QueryRow(query, labId)
	if err := row.Scan(
		&examMode,
		&examPin,
	); err != nil {
		if err == sql.ErrNoRows {
			return "000000", nil // No testcase found
		}
		return "", err // Other error
	}

	if !examMode {
		return "000000", nil // If exam mode is not enabled, return default pin
	}

	if examPin == nil {
		return "000000", nil // If exam pin is empty, return default pin
	}

	return examPin.String, nil
}
