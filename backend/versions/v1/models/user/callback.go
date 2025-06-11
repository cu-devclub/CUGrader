package user

import "database/sql"

func (um *UserModel) Callback(email string, name string, picture string) (int, int, error) {
	var userID int
	var currentPictureURL string

	err := um.DB.QueryRow(`SELECT id, picture FROM "user" WHERE email = $1`, email).Scan(&userID, &currentPictureURL)
	if err == sql.ErrNoRows {
		err := um.DB.QueryRow(`INSERT INTO "user" (email, name, picture) VALUES ($1, $2, $3) RETURNING id`, email, name, picture).Scan(&userID)
		if err != nil {
			return 0, 500, err
		}
		return userID, 200, nil
	} else if err != nil {
		return 0, 500, err
	}

	if currentPictureURL != picture {
		_, err := um.DB.Exec(`UPDATE "user" SET picture = $1 WHERE id = $2`, picture, userID)
		if err != nil {
			return 0, 500, err
		}
	}

	return userID, 200, nil
}
