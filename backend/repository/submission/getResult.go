package submission

import (
	"cugrader/connection/db"
	"cugrader/logic/utils"
	submissionStruct "cugrader/structure/submission"
	"database/sql"
)

func GetNormal(SubmissionId int) (submissionStruct.NormalTestcase, error) {
	var message string
	var is_failed bool
	var ObjectId string
	query := `SELECT 
			r.message,
			r.is_failed,
			t.testcase_object_id
		FROM 
			result r
			LEFT JOIN testcase t ON t.id = r.testcase_id
		WHERE 
			r.submission_id=$1 AND secret_testcase_id IS NULL`
	row := db.YSQL.QueryRow(query, SubmissionId)
	if err := row.Scan(&message, &is_failed, &ObjectId); err != nil {
		if err == sql.ErrNoRows {
			return submissionStruct.NormalTestcase{
				Message: "",
				Status:  "pending",
			}, nil
		}
		return submissionStruct.NormalTestcase{}, err
	}
	status := "pass"
	if is_failed {
		status = "fail"
	}
	input, err := utils.GetCodeContent(ObjectId)
	if err != nil {
		return submissionStruct.NormalTestcase{}, err
	}

	return submissionStruct.NormalTestcase{
		Input:   input,
		Message: message,
		Status:  status,
	}, nil
}

func GetSecret(SubmissionId int) (submissionStruct.SecretTestcase, error) {
	var message string
	var is_failed bool
	query := `SELECT 
			message,
			is_failed
		FROM 
			result 
		WHERE 
			submission_id=$1 AND testcase_id IS NULL`
	row := db.YSQL.QueryRow(query, SubmissionId)
	if err := row.Scan(&message, &is_failed); err != nil {
		if err == sql.ErrNoRows {
			return submissionStruct.SecretTestcase{
				Message: "",
				Status:  "pending",
			}, nil
		}
		return submissionStruct.SecretTestcase{}, err
	}
	status := "pass"
	if is_failed {
		status = "fail"
	}
	return submissionStruct.SecretTestcase{
		Message: message,
		Status:  status,
	}, nil
}
