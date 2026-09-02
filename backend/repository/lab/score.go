package lab

import (
	"context"
	"cugrader/connection/db"
	labStruct "cugrader/structure/lab"
	"encoding/json"
	"fmt"
)

func GetLabScoreJSON(labID int) (labStruct.FinalLabScoreJSON, error) {
	const query = `
WITH question_list AS (
    SELECT q.id AS question_id,
           q.lab_id,
           q.number,
           q.score AS max_score
    FROM question q
    WHERE q.lab_id = $1
),
user_question_scores AS (
    SELECT
        u.id AS user_id,
        u.name AS user_name,
        g.group_name,
        q.question_id,
        q.number AS question_number,
        s.id AS submission_id,
        s.timestamp AS submission_timestamp,
        COALESCE(SUM(r.score), 0) AS question_score
    FROM question_list q
    JOIN submission s ON s.question_id = q.question_id
    JOIN class_student cs ON cs.id = s.class_student_id
    JOIN "user" u ON u.id = cs.user_id
    LEFT JOIN "group" g ON g.id = cs.group_id
    LEFT JOIN result r ON r.submission_id = s.id AND r.question_id = q.question_id
    GROUP BY u.id, u.name, g.group_name, q.question_id, q.number, s.id, s.timestamp
),
user_total_scores AS (
    SELECT user_id, SUM(question_score) AS total_score
    FROM user_question_scores
    GROUP BY user_id
),
user_question_json AS (
    SELECT
        uqs.user_id,
        jsonb_agg(jsonb_build_object(
            'number', uqs.question_number,
            'score', uqs.question_score,
            'submissionId', uqs.submission_id,
            'timestamp', uqs.submission_timestamp
        )) AS questions_json
    FROM user_question_scores uqs
    GROUP BY uqs.user_id
),
final_students AS (
    SELECT jsonb_agg(jsonb_build_object(
        'name', uqs.user_name,
        'group', uqs.group_name,
        'score', uts.total_score,
        'questions', uqj.questions_json
    )) AS students
    FROM user_question_scores uqs
    JOIN user_total_scores uts ON uts.user_id = uqs.user_id
    JOIN user_question_json uqj ON uqj.user_id = uqs.user_id
)
SELECT 
    (SELECT SUM(score) FROM question WHERE lab_id = $1) AS max_score,
    (SELECT jsonb_agg(score ORDER BY id) FROM question WHERE lab_id = $1) AS question_max_score,
    (SELECT students FROM final_students)
`

	var (
		maxScore          int
		questionMaxScores json.RawMessage
		studentsRaw       json.RawMessage
	)

	err := db.YSQL.QueryRowContext(context.Background(), query, labID).Scan(&maxScore, &questionMaxScores, &studentsRaw)
	if err != nil {
		return labStruct.FinalLabScoreJSON{}, fmt.Errorf("query failed: %w", err)
	}

	var final labStruct.FinalLabScoreJSON
	final.MaxScore = maxScore
	if err := json.Unmarshal(questionMaxScores, &final.QuestionMaxScores); err != nil {
		return labStruct.FinalLabScoreJSON{}, fmt.Errorf("failed to unmarshal question_max_score: %w", err)
	}
	if err := json.Unmarshal(studentsRaw, &final.Students); err != nil {
		return labStruct.FinalLabScoreJSON{}, fmt.Errorf("failed to unmarshal students: %w", err)
	}

	return final, nil
}
