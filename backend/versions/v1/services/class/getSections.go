package class

func (s *ClassService) GetSections(classId int) ([]int, error) {
	return s.Model.GetAllSections(classId)
}

func (s *ClassService) GetSectionsForUser(classId int, userId int) ([]int, error) {
	return s.Model.GetSectionsForUser(classId, userId)
}
