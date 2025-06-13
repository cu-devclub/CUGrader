package class

func (s *ClassService) GetAllSections(classId int) ([]int, error) {
	sections, err := s.Model.GetAllSections(classId)
	if err != nil {
		return nil, err
	}
	if sections == nil {
		return []int{}, nil
	}
	return sections, nil
}

func (s *ClassService) GetSectionsForUser(classId int, userId int) ([]int, error) {
	sections, err := s.Model.GetSectionsForUser(classId, userId)
	if err != nil {
		return nil, err
	}
	if sections == nil {
		return []int{}, nil
	}
	return sections, nil
}
