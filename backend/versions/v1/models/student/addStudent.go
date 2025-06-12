package student

func (m *StudentModel) Add(classID int, Email int, sectionID int, groupID *int) error {
	var userID int
	err := m.DB.QueryRow(`SELECT id FROM "user" WHERE email = $1`, Email).Scan(&userID)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO class_student (class_id, user_id, section_id, group_id)
		VALUES ($1, $2, $3, $4)
	`
	_, err = m.DB.Exec(query, classID, userID, sectionID, groupID)
	return err
}
