package student

func (s *StudentService) AddStudent(ClassID int, UserID int, SectionID int, GroupID *int) error {
	return s.Model.Add(ClassID, UserID, SectionID, GroupID)
}
