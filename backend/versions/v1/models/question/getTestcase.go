package question

import (
	"context"
	"database/sql"
)

func (m *QuestionModel) GetTestcaseByQuestionID(questionID int) (*TestcaseModel, error) {
	query := `SELECT
		id,
		testcase_object_id,
		secret_testcase_object_id
	FROM testcase t
	INNER JOIN question q ON t.id = q.testcase_id
	WHERE q.id = $1`
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

func (m *QuestionModel) GetTestcaseCodeByTestcaseID(testcaseID string) (string, error) {
	// Get the testcase ID from the database
	query := `SELECT testcase_object_id from testcase WHERE id = $1`
	row := m.DB.QueryRow(query, testcaseID)
	var testcaseObjectID string
	if err := row.Scan(&testcaseObjectID); err != nil {
		if err == sql.ErrNoRows {
			return "", nil // No testcase found
		}
		return "", err // Other error
	}

	// Use the helper method to get code content from MongoDB
	return m.GetCodeContent(context.TODO(), testcaseObjectID)
}
