package utils

import "cugrader/connection/db"

// IsStudentAssignedToQuestion checks if a student can access a question based on their user ID and the question ID.
// It checks if the question is assigned to a group that the student is part of.
func IsStudentAssignedToQuestion(questionID int, userID int) (bool, error) {
	// user_id -> class_student.user_id
	// class_student.group_id -> assign_to.group_id
	// assign_to.lab_id -> question.lab_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	query := `SELECT EXISTS (
	  SELECT 1 FROM class_student cs
		INNER JOIN assign_to at ON cs.group_id = at.group_id
		INNER JOIN question q ON at.lab_id = q.lab_id
		WHERE q.id = $1 AND cs.user_id = $2
	)`
	var exists bool
	err := db.YSQL.QueryRow(query, questionID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// IsUserAnAssistantToQuestion checks if a user is an assistant for a specific question.
// It checks if the question is assigned to a class that the user is part of as an assistant.
func IsUserAnAssistantToQuestion(questionID int, userID int) (bool, error) {
	// user_id -> class_assistant.user_id
	// class_assistant.class_id -> lab.class_id
	// lab.id -> question.lab_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	query := `SELECT EXISTS (
		SELECT 1 FROM class_assistant ca
		INNER JOIN lab ON ca.class_id = lab.class_id
		INNER JOIN question q ON lab.id = q.lab_id
		WHERE q.id = $1 AND ca.user_id = $2
	)`
	var exists bool
	err := db.YSQL.QueryRow(query, questionID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func IsUserAnAssistantToLab(labID int, userID int) (bool, error) {
	// user_id -> class_assistant.user_id
	// class_assistant.class_id -> lab.class_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	query := `SELECT EXISTS (
		SELECT 1 FROM class_assistant ca
		INNER JOIN lab ON ca.class_id = lab.class_id
		WHERE lab.id = $1 AND ca.user_id = $2
	)`
	var exists bool
	err := db.YSQL.QueryRow(query, labID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func IsUserAnAssistantToAddfile(addfileID int, userID int) (bool, error) {
	// user_id -> class_assistant.user_id
	// class_assistant.class_id -> lab.class_id
	// lab.id -> addition_files.lab_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	query := `SELECT EXISTS (
		SELECT 1 FROM class_assistant ca
		INNER JOIN lab ON ca.class_id = lab.class_id
		INNER JOIN addition_files af ON lab.id = af.lab_id
		WHERE af.id = $1 AND ca.user_id = $2
	)`
	var exists bool
	err := db.YSQL.QueryRow(query, addfileID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// IsStudentAssignedToLabID checks if a student can access a lab based on their user ID and the lab ID.
// It check if student is enrolled in the class that the lab belongs to.
func IsStudentAssignedToLabID(userID int, labID int) (bool, error) {
	query := `SELECT EXISTS (
		SELECT 1 FROM class_student cs
		INNER JOIN lab l on cs.class_id = l.class_id
		WHERE cs.user_id = $1 AND l.id = $2)`
	var exists bool
	err := db.YSQL.QueryRow(query, userID, labID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func IsStudentAssignedToLabByTestcaseID(userID int, testcaseID int) (bool, error) {
	query := `SELECT EXISTS (
		SELECT 1 FROM class_student cs
		INNER JOIN lab l on cs.class_id = l.class_id
		WHERE cs.user_id = $1 AND l.testcase_id = $2)`
	var exists bool
	err := db.YSQL.QueryRow(query, userID, testcaseID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func IsStudentOwnSubmissionId(userId int, SubmissionId int) (bool, error) {
	query := `SELECT EXISTS (
		SELECT 1 FROM submission s
		INNER JOIN class_student cs on cs.id = s.class_student_id
		WHERE cs.user_id = $1 AND s.id = $2)`
	var exists bool
	err := db.YSQL.QueryRow(query, userId, SubmissionId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
