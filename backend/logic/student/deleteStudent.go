package student

import "cugrader/repository/student"

func DeleteStudent(classID int, userID int) error {
	return student.Delete(classID, userID)
}
