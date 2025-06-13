package student

func (s *StudentService) DeleteStudent(classID int, userID int) error {
	return s.Model.Delete(classID, userID)
}
