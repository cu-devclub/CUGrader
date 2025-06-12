package student

func (m *StudentModel) Add(classID int, userID int, sectionID int, groupID *int) error {
	query := `
		INSERT INTO class_student (class_id, user_id, section_id, group_id)
		VALUES ($1, $2, $3, $4)
	`
	_, err := m.DB.Exec(query, classID, userID, sectionID, groupID)
	return err
}
