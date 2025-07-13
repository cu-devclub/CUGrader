package utils

import "cugrader/connection/db"

func UserIDorInsert(Email string) (int, error) {
	var userID int
	err := db.YSQL.QueryRow(`SELECT id FROM "user" WHERE email = $1`, Email).Scan(&userID)
	if err == nil {
		return userID, nil
	}
	// If not found, insert new user
	err = db.YSQL.QueryRow(
		`INSERT INTO "user" (email, name, picture) VALUES ($1, '-', '') RETURNING id`,
		Email,
	).Scan(&userID)
	if err != nil {
		return 0, err
	}
	return userID, nil
}
