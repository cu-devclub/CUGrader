package assistant

func (m *AssistantModel) GetAssistantsAndInstructors(classID int) ([]Info, []Info, error) {
	// Assistants
	assistantsQuery := `
		SELECT u.id, u.name, u.email, ca.is_leader
		FROM class_assistant ca
		JOIN "user" u ON ca.user_id = u.id
		WHERE ca.class_id = $1`
	rows, err := m.DB.Query(assistantsQuery, classID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var assistants []Info
	for rows.Next() {
		var info Info
		if err := rows.Scan(&info.UserID, &info.Name, &info.Email, &info.IsLeader); err != nil {
			return nil, nil, err
		}
		assistants = append(assistants, info)
	}

	// Instructors
	instructorsQuery := `
		SELECT u.id, u.name, u.email
		FROM teacher t
		JOIN "user" u ON t.user_id = u.id
		JOIN class c ON c.creator_user_id = t.user_id
		WHERE c.id = $1`
	instructorRows, err := m.DB.Query(instructorsQuery, classID)
	if err != nil {
		return nil, nil, err
	}
	defer instructorRows.Close()

	var instructors []Info
	for instructorRows.Next() {
		var info Info
		if err := instructorRows.Scan(&info.UserID, &info.Name, &info.Email); err != nil {
			return nil, nil, err
		}
		instructors = append(instructors, info)
	}

	return assistants, instructors, nil
}
