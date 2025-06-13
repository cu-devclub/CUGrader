package class

func (s *ClassService) GetGroups(classId int) ([]string, error) {
	groups, err := s.Model.GetAllGroups(classId)
	if err != nil {
		return nil, err
	}
	if groups == nil {
		return []string{}, nil
	}
	return groups, nil
}
