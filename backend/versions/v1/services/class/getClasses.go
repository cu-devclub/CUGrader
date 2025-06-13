package class

import "CUGrader/backend/versions/v1/models/class"

func (s *ClassService) GetClassByYearSemester(year int, semester int) ([]class.ClassObjectModel, error) {
	classes, err := s.Model.GetClassesByYearSemester(year, semester)
	if err != nil {
		return []class.ClassObjectModel{}, err
	}
	if classes == nil {
		return []class.ClassObjectModel{}, nil
	}
	return classes, nil
}

func (s *ClassService) GetClassesByYearSemesterForUser(year int, semester int, userID int) ([]class.ClassObjectModel, []class.ClassObjectModel, error) {
	study, assistant, err := s.Model.GetClassesByYearSemesterForUser(year, semester, userID)
	if err != nil {
		return []class.ClassObjectModel{}, []class.ClassObjectModel{}, err
	}
	if study == nil {
		study = []class.ClassObjectModel{}
	}
	if assistant == nil {
		assistant = []class.ClassObjectModel{}
	}
	return study, assistant, nil
}
