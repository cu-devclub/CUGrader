package lab

import (
	"context"
	"cugrader/connection/db"
	"database/sql"
)

func GetTestcaseByQuestionID(questionID int) (*TestcaseModel, error) {
	query := `SELECT
		t.id,
		testcase_object_id,
		secret_testcase_object_id
	FROM testcase t
	INNER JOIN question q ON t.id = q.testcase_id
	WHERE q.id = $1`
	row := db.YSQL.QueryRow(query, questionID)
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

func GetTestcaseCodeByTestcaseID(testcaseID int) (*TestcaseCodeResponseModel, error) {
	// Get the testcase ID from the database
	query := `SELECT testcase_object_id, secret_testcase_object_id from testcase WHERE id = $1`
	row := db.YSQL.QueryRow(query, testcaseID)
	var testcaseObjectID string
	var secretTestcaseObjectID string
	if err := row.Scan(&testcaseObjectID, &secretTestcaseObjectID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No testcase found
		}
		return nil, err // Other error
	}

	testcaseContent, err := GetCodeContent(context.TODO(), testcaseObjectID)
	if err != nil {
		return nil, err // Error getting testcase content
	}
	secretTestcaseContent, err := GetCodeContent(context.TODO(), secretTestcaseObjectID)
	if err != nil {
		return nil, err // Error getting testcase content
	}
	// Use the helper method to get code content from MongoDB
	return &TestcaseCodeResponseModel{
		Testcase:       testcaseContent,
		SecretTestcase: secretTestcaseContent,
	}, nil

}

func getMultilangTestcaseQuerying(questionID int, query string) ([]MultilangTestcase, error) {
	// var testcaseObjectIDs []string
	rows, err := db.YSQL.Query(query, questionID)
	if err != nil {
		return nil, err // Error querying database
	}

	var testcases = []MultilangTestcase{}
	defer rows.Close()
	for rows.Next() {
		var objectID string
		if err := rows.Scan(&objectID); err != nil {
			return nil, err // Error scanning row
		}
		testcase, err := GetTestcaseContent(context.TODO(), objectID)
		if err != nil {
			return nil, err // Error getting testcase content
		}
		testcases = append(testcases, MultilangTestcase{Input: testcase.Input, Output: testcase.Output})
	}
	if err := rows.Err(); err != nil {
		return nil, err // Error after iterating through rows
	}

	// for _, objectID := range testcaseObjectIDs {
	// 	testcase, err := GetTestcaseContent(context.TODO(), objectID)
	// 	if err != nil {
	// 		return nil, err // Error getting testcase content
	// 	}
	// 	testcases = append(testcases, MultilangTestcase{Input: testcase.Input, Output: testcase.Output}) // Assuming output is empty for now
	// }
	return testcases, nil
}

func GetMultilangTestcaseCodesByQuestionID(questionID int) ([]MultilangTestcase, error) {
	query := `SELECT
		object_id
	FROM multilang_testcase
	WHERE question_id = $1`

	return getMultilangTestcaseQuerying(questionID, query)
}

func GetMultilangSecretTestcaseCodesByQuestionID(questionID int) ([]MultilangTestcase, error) {
	query := `SELECT
		object_id
	FROM multilang_secret_testcase
	WHERE question_id = $1`

	return getMultilangTestcaseQuerying(questionID, query)
}

func GetMultilangTestcaseCodeByQuestionID(questionID int, isGetSecretTestcase bool) (*TestcaseWithSecretModel, error) {
	testcaseCode, err := GetMultilangTestcaseCodesByQuestionID(questionID)
	if err != nil {
		return nil, err // Error getting testcase codes
	}

	secretTestcaseCode := []MultilangTestcase{} // Initialize empty slice for secret testcase codes
	if isGetSecretTestcase {
		secretTestcaseCode, err = GetMultilangSecretTestcaseCodesByQuestionID(questionID)
		if err != nil {
			return nil, err // Error getting secret testcase codes
		}
	}

	return &TestcaseWithSecretModel{
		Testcase:       testcaseCode,
		SecretTestcase: secretTestcaseCode,
	}, nil
}
