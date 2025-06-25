package question

import "database/sql"

// GetQuestionIdsByLabId retrieves all question IDs associated with a specific lab ID.
func (m *QuestionModel) GetQuestionIdsByLabId(labId int) ([]int, error) {
	questionId := []int{}
	query := `SELECT id FROM question WHERE lab_id = $1`
	rows, err := m.DB.Query(query, labId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		questionId = append(questionId, id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return questionId, nil
}

func (m *QuestionModel) GetQuestionByID(questionId int) (*QuestionFullModel, error) {
	query := `SELECT 
		id,
		lab_id,
		number,
		name,
		score,
		description,
		answer,
		predefine,
		testcase_object_id,
		secret_testcase_object_id
	FROM question
	WHERE id = $1`
	row := m.DB.QueryRow(query, questionId)
	question := &QuestionFullModel{}
	if err := row.Scan(
		&question.ID,
		&question.LabID,
		&question.Number,
		&question.Name,
		&question.Score,
		&question.Description,
		&question.Answer,
		&question.Predefine,
		&question.TestcaseObjectID,
		&question.SecretTestcaseObjectID,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No question found
		}
		return nil, err // Other error
	}
	return question, nil
}
