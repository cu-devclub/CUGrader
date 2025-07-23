package lab

import (
	"cugrader/connection/db"
	"time"
)

func InsertLab(ClassId int, number int, name string, Publish time.Time, Due time.Time, close_on_due bool, exam_mode bool, exam_pin *int, show_score_on_lock bool, testcase_id int, descriptionID string, lab_testcase_score int) (int, error) {
	query := `INSERT INTO lab (
		class_id,
		number,
		name,
		publish,
		due,
		close_on_due,
		exam_mode,
		exam_pin,
		show_score_on_lock,
		testcase_id,
		description_object_id,
		lab_testcase_score
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	RETURNING id`

	var labID int
	err := db.YSQL.QueryRow(query, ClassId, number, name, Publish, Due, close_on_due, exam_mode, exam_pin, show_score_on_lock, testcase_id, descriptionID, lab_testcase_score).Scan(&labID)
	if err != nil {
		return 0, err
	}
	return labID, nil
}

func InsertTestcase(testcase string, secret_testcase string) (int, error) {
	query := `INSERT INTO testcase (
		testcase_object_id,
		secret_testcase_object_id
	) VALUES ($1, $2)
	RETURNING id`

	var testcaseID int
	err := db.YSQL.QueryRow(query, testcase, secret_testcase).Scan(&testcaseID)
	if err != nil {
		return 0, err
	}
	return testcaseID, nil
}

func InsertLang(labId int, LanguageId int) error {
	query := `INSERT INTO lab_language (
		lab_id,
		system_language_id
	) VALUES ($1, $2)
	ON CONFLICT (lab_id, system_language_id) DO NOTHING`

	_, err := db.YSQL.Exec(query, labId, LanguageId)
	if err != nil {
		return err
	}
	return nil
}

func InsertGroup(labId int, GroupId int) error {
	query := `INSERT INTO assign_to (
		lab_id,
		group_id
	) VALUES ($1, $2)
	ON CONFLICT (lab_id, group_id) DO NOTHING`

	_, err := db.YSQL.Exec(query, labId, GroupId)
	if err != nil {
		return err
	}
	return nil
}

func InsertAddfile(labId int, path string) error {
	query := `INSERT INTO addition_files (
		lab_id,
		path
	) VALUES ($1, $2)
	ON CONFLICT (lab_id, path) DO NOTHING`

	_, err := db.YSQL.Exec(query, labId, path)
	if err != nil {
		return err
	}
	return nil
}

func InsertQuestion(LabId int, number int, name string, score int, description string, answer string, predefine string, testcaseId int) (int, error) {
	query := `INSERT INTO question (
		lab_id,
		number,
		name,
		score,
		description,
		answer,
		predefine,
		testcase_id
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING id`

	var QuestionID int
	err := db.YSQL.QueryRow(query, LabId, number, name, score, description, answer, predefine, testcaseId).Scan(&QuestionID)
	if err != nil {
		return 0, err
	}
	return QuestionID, nil
}

func InsertMultilangTestcase(questionId int, object_id string) error {
	query := `INSERT INTO multilang_testcase (
		question_id,
		object_id
	) VALUES ($1, $2)
	ON CONFLICT (question_id, object_id) DO NOTHING`

	_, err := db.YSQL.Exec(query, questionId, object_id)
	if err != nil {
		return err
	}
	return nil
}

func InsertMultilangSecretTestcase(questionId int, object_id string) error {
	query := `INSERT INTO multilang_secret_testcase (
		question_id,
		object_id
	) VALUES ($1, $2)
	ON CONFLICT (question_id, object_id) DO NOTHING`

	_, err := db.YSQL.Exec(query, questionId, object_id)
	if err != nil {
		return err
	}
	return nil
}
