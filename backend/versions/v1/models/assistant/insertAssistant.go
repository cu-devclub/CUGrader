package assistant

func (m *AssistantModel) Insert(classID int, email string) error {
	query := `
		INSERT INTO assistant (class_id, email)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`
	_, err := m.DB.Exec(query, classID, email)
	return err
}
