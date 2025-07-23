package utils

import "cugrader/connection/db"

func GetClassStudentIdWithQuestionIdAndUserId(QuestionId int, UserId int) (int, error) {
	query := `
		SELECT 
			cs.id
		FROM 
			question q
			LEFT JOIN lab l ON l.id = q.lab_id
			LEFT JOIN class_student cs ON cs.class_id = l.class_id
		WHERE 
			cs.user_id = $1 AND q.id = $2`
	var ClassStudentId int
	err := db.YSQL.QueryRow(query, UserId, QuestionId).Scan(&ClassStudentId)
	if err != nil {
		return 0, err
	}
	return ClassStudentId, nil
}
