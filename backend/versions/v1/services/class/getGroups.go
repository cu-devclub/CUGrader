package class

func (s *ClassService) GetGroups(classId int) ([]string, error) {
	return s.Model.GetAllGroups(classId)
}
