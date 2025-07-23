package utils

import (
	"cugrader/connection/db"
	"fmt"
)

func GetUserIDByEmail(email string) (int, error) {
	var userID int
	err := db.YSQL.QueryRow(`SELECT id FROM "user" WHERE email = $1`, email).Scan(&userID)
	if err != nil {
		return 0, fmt.Errorf("user not found: %w", err)
	}
	return userID, nil
}
