package assistant

func (m *AssistantModel) Remove(classID int, email string) error {
	query := `DELETE FROM assistant WHERE class_id = $1 AND email = $2`
	_, err := m.DB.Exec(query, classID, email)
	return err
}
