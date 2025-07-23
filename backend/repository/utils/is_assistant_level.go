package utils

import "cugrader/connection/db"

func IsUserAdminOrTeacher(userID int) bool {
	// Check if user is in teacher table
	var exists bool
	err := db.YSQL.QueryRow("SELECT EXISTS(SELECT 1 FROM teacher WHERE user_id = $1)", userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	// Check if user is in admin table
	err = db.YSQL.QueryRow("SELECT EXISTS(SELECT 1 FROM admin WHERE user_id = $1)", userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	// Check if user is in student table
	err = db.YSQL.QueryRow("SELECT EXISTS(SELECT 1 FROM student WHERE user_id = $1)", userID).Scan(&exists)
	if err != nil || !exists {
		return false
	}

	return false
}

func IsUserTeacherAdminOrAssistantByLabID(labID int, userID int) bool {
	// Check if user is an admin or teacher
	if IsUserAdminOrTeacher(userID) {
		return true
	}

	// Check if user is assistant in the lab
	var exists bool
	query := `SELECT EXISTS (
		SELECT 1
		FROM class_assistant ca
		INNER JOIN lab l ON ca.class_id = l.class_id
		WHERE l.id = $1 AND ca.user_id = $2
	)`
	err := db.YSQL.QueryRow(query, labID, userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	return false
}

func IsUserTeacherAdminOrAssistant(classID int, userID int) bool {
	// Check if user is an admin or teacher
	if IsUserAdminOrTeacher(userID) {
		return true
	}

	// Check if user is assistant in the class
	var exists bool
	err := db.YSQL.QueryRow("SELECT EXISTS(SELECT 1 FROM class_assistant WHERE class_id = $1 AND user_id = $2)", classID, userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	return false
}

func IsUserCanAccessClass(classID int, userID int) bool {
	if IsUserTeacherAdminOrAssistant(classID, userID) {
		return true
	}

	var exists bool
	err := db.YSQL.QueryRow("SELECT EXISTS(SELECT 1 FROM class_student WHERE class_id = $1 AND user_id = $2)", classID, userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	return false
}

func IsUserAnAssistantToTestcase(testcaseID int, userID int) (bool, error) {
	// Check if user is assistant in the class of the testcase
	var exists bool
	query := `SELECT EXISTS (
		SELECT 1
		FROM class_assistant ca
		INNER JOIN lab l ON ca.class_id = l.class_id
		INNER JOIN testcase t ON l.id = t.lab_id
		WHERE t.id = $1 AND ca.user_id = $2
	)`
	err := db.YSQL.QueryRow(query, testcaseID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
