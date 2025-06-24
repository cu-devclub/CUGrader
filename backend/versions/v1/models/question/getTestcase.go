package question

import "database/sql"

func (m *QuestionModel) GetTestcaseByQuestionID(questionID int) (*TestcaseModel, error) {
	query := `SELECT
		id,
		testcase_object_id,
		secret_testcase_object_id
	FROM testcase t
	INNER JOIN question q ON t.id = q.testcase_id
	WHERE q.id = ?`
	row := m.DB.QueryRow(query, questionID)
	testcase := &TestcaseModel{}
	if err := row.Scan(
		&testcase.ID,
		&testcase.TestcaseObjectID,
		&testcase.SecretTestcaseObjectID,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No testcase found
		}
		return nil, err // Other error
	}
	return testcase, nil
}
