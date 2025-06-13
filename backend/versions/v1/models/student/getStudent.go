package student

func (m *StudentModel) GetByClassID(classID int) ([]StudentInfo, error) {
	query := `
	SELECT u.id, u.name, u.email, u.picture, s.student_id, cs.withdrawn
	FROM class_student cs
	INNER JOIN "user" u ON cs.user_id = u.id
	INNER JOIN student s ON s.user_id = u.id
	WHERE cs.class_id = $1
	`

	rows, err := m.DB.Query(query, classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var students []StudentInfo
	for rows.Next() {
		var s StudentInfo
		err := rows.Scan(&s.UserID, &s.Name, &s.Email, &s.Picture, &s.StudentID, &s.Withdrawn)
		if err != nil {
			return nil, err
		}
		s.MaxScore = 0 // default placeholder
		students = append(students, s)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return students, nil
}
