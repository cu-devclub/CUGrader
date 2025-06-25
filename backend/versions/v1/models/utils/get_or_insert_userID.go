package utils

func (m *UtilsModel) UserIDorInsert(Email string) (int, error) {
	var userID int
	err := m.DB.QueryRow(`SELECT id FROM "user" WHERE email = $1`, Email).Scan(&userID)
	if err == nil {
		return userID, nil
	}
	// If not found, insert new user
	err = m.DB.QueryRow(
		`INSERT INTO "user" (email, name, picture) VALUES ($1, '-', '') RETURNING id`,
		Email,
	).Scan(&userID)
	if err != nil {
		return 0, err
	}
	return userID, nil
}
