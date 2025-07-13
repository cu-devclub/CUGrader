package student

import "cugrader/repository/student"

func AddStudent(ClassID int, Email int, SectionID int, GroupID *int) error {
	return student.Add(ClassID, Email, SectionID, GroupID)
}
