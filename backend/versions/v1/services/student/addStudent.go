package student

func (s *StudentService) AddStudent(ClassID int, Email int, SectionID int, GroupID *int) error {
	return s.Model.Add(ClassID, Email, SectionID, GroupID)
}
