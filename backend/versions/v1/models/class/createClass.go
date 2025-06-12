package class

func (m *ClassModel) Insert(courseID int, name string, semester int, year int, pictureID int, creatorUserID int) (int, error) {
	var classID int
	query := `
		INSERT INTO "class" (course_id, name, semester, year, picture_id, creater_user_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`
	var picID interface{}
	if pictureID == 0 {
		picID = nil
	} else {
		picID = pictureID
	}
	err := m.DB.QueryRow(query, courseID, name, semester, year, picID, creatorUserID).Scan(&classID)
	return classID, err
}

func (m *ClassModel) InsertUserIfNotExist(email, name string) (int, error) {
	var userID int
	err := m.DB.QueryRow(`SELECT id FROM "user" WHERE email = $1`, email).Scan(&userID)
	if err == nil {
		return userID, nil
	}
	// Insert if not exist
	err = m.DB.QueryRow(
		`INSERT INTO "user" (email, name, picture) VALUES ($1, $2, '') RETURNING id`,
		email, name,
	).Scan(&userID)
	return userID, err
}

func (m *ClassModel) InsertStudentIfNotExist(userID int, studentID string) error {
	var exists bool
	err := m.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM student WHERE user_id = $1)`, userID).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	_, err = m.DB.Exec(`INSERT INTO student (user_id, student_id) VALUES ($1, $2)`, userID, studentID)
	return err
}

func (m *ClassModel) InsertSectionIfNotExist(classID int, sectionNumber int) (int, error) {
	var sectionID int
	err := m.DB.QueryRow(
		`SELECT id FROM section WHERE class_id = $1 AND section_number = $2`,
		classID, sectionNumber,
	).Scan(&sectionID)
	if err == nil {
		return sectionID, nil
	}
	err = m.DB.QueryRow(
		`INSERT INTO section (class_id, section_number) VALUES ($1, $2) RETURNING id`,
		classID, sectionNumber,
	).Scan(&sectionID)
	return sectionID, err
}

func (m *ClassModel) InsertGroupIfNotExist(classID int, groupName string) (int, error) {
	var groupID int
	err := m.DB.QueryRow(
		`SELECT id FROM "group" WHERE class_id = $1 AND group_name = $2`,
		classID, groupName,
	).Scan(&groupID)
	if err == nil {
		return groupID, nil
	}
	err = m.DB.QueryRow(
		`INSERT INTO "group" (class_id, group_name) VALUES ($1, $2) RETURNING id`,
		classID, groupName,
	).Scan(&groupID)
	return groupID, err
}

func (m *ClassModel) InsertClassStudent(classID, userID, sectionID int, groupID *int) error {
	if groupID != nil {
		_, err := m.DB.Exec(
			`INSERT INTO class_student (class_id, user_id, section_id, group_id) VALUES ($1, $2, $3, $4)`,
			classID, userID, sectionID, *groupID,
		)
		return err
	}
	_, err := m.DB.Exec(
		`INSERT INTO class_student (class_id, user_id, section_id, group_id) VALUES ($1, $2, $3, NULL)`,
		classID, userID, sectionID,
	)
	return err
}
