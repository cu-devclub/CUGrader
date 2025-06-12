package student

func (m *StudentModel) Delete(classID int, userID int) error {
	query := `
		DELETE FROM class_student
		WHERE class_id = $1 AND user_id = $2
	`
	_, err := m.DB.Exec(query, classID, userID)
	return err
}
