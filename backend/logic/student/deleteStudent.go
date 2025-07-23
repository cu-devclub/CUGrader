package student

import "cugrader/repository/student"

func DeleteStudent(StudentID int) error {
	return student.Delete(StudentID)
}
