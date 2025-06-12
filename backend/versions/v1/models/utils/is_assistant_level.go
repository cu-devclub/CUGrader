package utils

func (m *UtilsModel) IsUserTeacherAdminOrAssistant(classID, userID int) bool {
	// Check if user is in teacher table
	var exists bool
	err := m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM teacher WHERE user_id = ?)", userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	// Check if user is in admin table
	err = m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM admin WHERE user_id = ?)", userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	// Check if user is in student table
	err = m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM student WHERE user_id = ?)", userID).Scan(&exists)
	if err != nil || !exists {
		return false
	}

	// Check if user is assistant in the class
	err = m.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM class_assistant WHERE class_id = ? AND user_id = ?)", classID, userID).Scan(&exists)
	if err == nil && exists {
		return true
	}

	return false
}
