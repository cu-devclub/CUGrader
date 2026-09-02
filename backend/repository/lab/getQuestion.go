package lab

import (
	"cugrader/connection/db"
	"database/sql"
)

// GetQuestionIdsByLabId retrieves all question IDs associated with a specific lab ID.
func GetQuestionIdsByLabId(labId int) ([]int, error) {
	questionId := []int{}
	query := `SELECT id FROM question WHERE lab_id = $1`
	rows, err := db.YSQL.Query(query, labId)
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

func GetQuestionByID(questionId int) (*QuestionFullModel, error) {
	query := `SELECT 
		question.id,
		lab_id,
		number,
		name,
		score,
		description,
		answer,
		predefine,
		testcase_id
	FROM question
	WHERE question.id = $1`
	row := db.YSQL.QueryRow(query, questionId)
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
		&question.TestcaseID,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No question found
		}
		return nil, err // Other error
	}

	Description, err := GetDescriptionByID(question.Description)
	if err != nil {
		return nil, nil
	}

	question.Description = Description

	return question, nil
}
