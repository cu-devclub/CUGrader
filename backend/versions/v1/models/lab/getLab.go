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
func (m *LabModel) GetLabAssignedGroupNames(labId int) ([]string, error) {
	query := `SELECT DISTINCT g.name FROM group g LEFT JOIN assign_to at ON g.id = at.group_id WHERE at.lab_id = ?`
	rows, err := m.DB.Query(query, labId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var groupNames []string
	for rows.Next() {
		var groupName string
		if err := rows.Scan(&groupName); err != nil {
			return nil, err
		}
		groupNames = append(groupNames, groupName)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return groupNames, nil
}
