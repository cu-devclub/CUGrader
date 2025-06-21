package question

// IsStudentAssignedToQuestion checks if a student can access a question based on their user ID and the question ID.
// It checks if the question is assigned to a group that the student is part of.
func (c *QuestionModel) IsStudentAssignedToQuestion(questionID int, userID int) (bool, error) {
	// user_id -> class_student.user_id
	// class_student.group_id -> assign_to.group_id
	// assign_to.lab_id -> question.lab_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	query := `SELECT EXISTS (
	  SELECT 1 FROM class_student cs
		INNER JOIN assign_to at ON cs.group_id = at.group_id
		INNER JOIN question q ON at.lab_id = q.lab_id
		WHERE q.id = ? AND cs.user_id = ?
	)`
	var exists bool
	err := c.DB.QueryRow(query, questionID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (c *QuestionModel) IsUserAnAssistantToQuestion(questionID int, userID int) (bool, error) {
	// user_id -> class_assistant.user_id
	// class_assistant.class_id -> lab.class_id
	// lab.id -> question.lab_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	query := `SELECT EXISTS (
		SELECT 1 FROM class_assistant ca
		INNER JOIN lab ON ca.class_id = lab.class_id
		INNER JOIN question q ON lab.id = q.lab_id
		WHERE q.id = ? AND ca.user_id = ?
	)`
	var exists bool
	err := c.DB.QueryRow(query, questionID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
