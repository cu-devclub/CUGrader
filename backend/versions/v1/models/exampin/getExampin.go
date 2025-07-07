package exampin

func (m *PinModel) GetExamPinByLabID(labID int) (*ExamPin, error) {
	query := `
		SELECT exam_pin
		FROM lab
		WHERE id = $1 AND exam_mode = TRUE
	`
	row := m.DB.QueryRow(query, labID)

	var pin ExamPin
	err := row.Scan(&pin.ExamPin)
	if err != nil {
		return nil, err
	}

	return &pin, nil
}
