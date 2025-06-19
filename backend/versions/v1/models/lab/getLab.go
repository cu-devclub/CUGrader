package lab

// GetLab retrieves a lab data by its ID from the database.
func (m *LabModel) GetLab(labId int) (*LabFullModel, error) {
	lab := &LabFullModel{}
	query := `SELECT 
		id,
		class_id,
		number,
		name,
		publish,
		due,
		close_on_due,
		exam_mode,
		exam_pin,
		show_score_on_lock,
		testcase_object_id,
		secret_testcase_object_id
	FROM lab
	WHERE id = ?`
	row := m.DB.QueryRow(query, labId)
	if err := row.Scan(
		&lab.ID,
		&lab.ClassID,
		&lab.Number,
		&lab.Name,
		&lab.Publish,
		&lab.Due,
		&lab.CloseOnDue,
		&lab.ExamMode,
		&lab.ExamPin,
		&lab.ShowScoreOnLock,
		&lab.TestcaseObjectID,
		&lab.SecretTestcaseObjectID,
	); err != nil {
		return nil, err
	}
	return lab, nil
}

// GetLabStudentDetail retrieves detailed information about a lab for students, including questions, languages, and assigned groups.
func (m *LabModel) GetLabAssignedGroups(labId int) ([]string, error) {
	query := `SELECT DISTINCT group_name FROM assigned_to WHERE lab_id = ?`
	rows, err := m.DB.Query(query, labId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var groups []string
	for rows.Next() {
		var group string
		if err := rows.Scan(&group); err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return groups, nil
}
