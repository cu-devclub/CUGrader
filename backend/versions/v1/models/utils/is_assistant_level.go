package utils

func (m *UtilsModel) IsUserAdminOrTeacher(userID int) bool {
	// Check if user is in teacher table
	var exists bool
	err := m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM teacher WHERE user_id = $1)", userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	// Check if user is in admin table
	err = m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM admin WHERE user_id = $1)", userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	// Check if user is in student table
	err = m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM student WHERE user_id = $1)", userID).Scan(&exists)
	if err != nil || !exists {
		return false
	}

	return false
}

func (m *UtilsModel) IsUserTeacherAdminOrAssistantByLabID(labID int, userID int) bool {
	// Check if user is an admin or teacher
	if m.IsUserAdminOrTeacher(userID) {
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
	err := m.DB.QueryRow(query, labID, userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	return false
}

func (m *UtilsModel) IsUserTeacherAdminOrAssistant(classID int, userID int) bool {
	// Check if user is an admin or teacher
	if m.IsUserAdminOrTeacher(userID) {
		return true
	}

	// Check if user is assistant in the class
	var exists bool
	err := m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM class_assistant WHERE class_id = $1 AND user_id = $2)", classID, userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	return false
}
