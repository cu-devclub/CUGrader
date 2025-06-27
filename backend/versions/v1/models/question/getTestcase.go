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

func (m *QuestionModel) getMultilangTestcaseQuerying(questionID int, query string) ([]MultilangTestcase, error) {
	var testcaseObjectIDs []string
	rows, err := m.DB.Query(query, questionID)
	if err != nil {
		return nil, err // Error querying database
	}

	defer rows.Close()
	for rows.Next() {
		var objectID string
		if err := rows.Scan(&objectID); err != nil {
			return nil, err // Error scanning row
		}
		testcaseObjectIDs = append(testcaseObjectIDs, objectID)
	}
	if err := rows.Err(); err != nil {
		return nil, err // Error after iterating through rows
	}
	var testcases = []MultilangTestcase{}
	for _, objectID := range testcaseObjectIDs {
		testcase, err := m.GetTestcaseContent(context.TODO(), objectID)
		if err != nil {
			return nil, err // Error getting testcase content
		}
		testcases = append(testcases, MultilangTestcase{Input: testcase.Input, Output: testcase.Output}) // Assuming output is empty for now
	}
	return testcases, nil
}

func (m *QuestionModel) GetMultilangTestcaseCodesByQuestionID(questionID int) ([]MultilangTestcase, error) {
	query := `SELECT
		object_id
	FROM multilang_testcase
	WHERE question_id = $1`

	return m.getMultilangTestcaseQuerying(questionID, query)
}

func (m *QuestionModel) GetMultilangSecretTestcaseCodesByQuestionID(questionID int) ([]MultilangTestcase, error) {
	query := `SELECT
		object_id
	FROM multilang_secret_testcase
	WHERE question_id = $1`

	return m.getMultilangTestcaseQuerying(questionID, query)
}

func (m *QuestionModel) GetMultilangTestcaseCodeByQuestionID(questionID int, isGetSecretTestcase bool) (TestcaseWithSecretModel, error) {
	testcaseCode, err := m.GetMultilangTestcaseCodesByQuestionID(questionID)
	if err != nil {
		return TestcaseWithSecretModel{}, err // Error getting testcase codes
	}

	secretTestcaseCode := []MultilangTestcase{} // Initialize empty slice for secret testcase codes
	if isGetSecretTestcase {
		secretTestcaseCode, err = m.GetMultilangSecretTestcaseCodesByQuestionID(questionID)
		if err != nil {
			return TestcaseWithSecretModel{}, err // Error getting secret testcase codes
		}
	}

	return TestcaseWithSecretModel{
		Testcase:       testcaseCode,
		SecretTestcase: secretTestcaseCode,
	}, nil
}
