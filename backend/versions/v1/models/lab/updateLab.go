package lab

// UpdateLab updates the details of a lab based on the provided labID and updates.
func (m *LabModel) UpdateLab(labID int, updates map[string]interface{}) error {
	// TODO(ptsgrn): Handling the existance of `testcase_id`
	query := `UPDATE labs 
	SET
		number = COALESCE($1, number),
		name = COALESCE($2, name),
		publish = COALESCE($3, publish),
		due = COALESCE($4, due),
		close_on_due = COALESCE($5, close_on_due),
		exam_mode = COALESCE($6, exam_mode),
		exam_pin = COALESCE($7, exam_pin),
		show_score_on_lock = COALESCE($8, show_score_on_lock),
	WHERE id = $11`
	args := []interface{}{
		updates["number"],
		updates["name"],
		updates["publish"],
		updates["due"],
		updates["close_on_due"],
		updates["exam_mode"],
		updates["exam_pin"],
		updates["show_score_on_lock"],
		labID,
	}

	_, err := m.DB.Exec(query, args...)
	if err != nil {
		return err
	}
	return nil
}
