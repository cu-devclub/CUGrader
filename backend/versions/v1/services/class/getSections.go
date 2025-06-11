package class

func (s *ClassService) GetSections(classId int) ([]int, error) {
	return s.Model.GetSections(classId)
}
