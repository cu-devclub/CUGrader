package user

import (
	"database/sql"
	"strings"
)

func (um *UserModel) Callback(email string, name string, picture string) (int, int, error) {
	var userID int
	var currentPictureURL string

	err := um.DB.QueryRow(`SELECT id, picture FROM "user" WHERE email = $1`, email).Scan(&userID, &currentPictureURL)
	if err == sql.ErrNoRows {
		err := um.DB.QueryRow(`INSERT INTO "user" (email, name, picture) VALUES ($1, $2, $3) RETURNING id`, email, name, picture).Scan(&userID)
		if err != nil {
			return 0, 500, err
		}
	} else if err != nil {
		return 0, 500, err
	}

	if currentPictureURL != picture {
		_, err := um.DB.Exec(`UPDATE "user" SET picture = $1 WHERE id = $2`, picture, userID)
		if err != nil {
			return 0, 500, err
		}
	}

	// Insert into student or teacher table if not exists
	if strings.HasSuffix(email, "@student.chula.ac.th") {
		studentID := email[:len(email)-len("@student.chula.ac.th")]
		var exists bool
		err := um.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM student WHERE user_id = $1)`, userID).Scan(&exists)
		if err != nil {
			return 0, 500, err
		}
		if !exists {
			_, err := um.DB.Exec(`INSERT INTO student (user_id, student_id) VALUES ($1, $2)`, userID, studentID)
			if err != nil {
				return 0, 500, err
			}
		}
	} else if strings.HasSuffix(email, "@chula.ac.th") {
		var exists bool
		err := um.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM teacher WHERE user_id = $1)`, userID).Scan(&exists)
		if err != nil {
			return 0, 500, err
		}
		if !exists {
			_, err := um.DB.Exec(`INSERT INTO teacher (user_id) VALUES ($1)`, userID)
			if err != nil {
				return 0, 500, err
			}
		}
	}

	return userID, 200, nil
}
