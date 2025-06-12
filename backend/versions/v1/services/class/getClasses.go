package class

import "CUGrader/backend/versions/v1/models/class"

func (s *ClassService) GetClassByYearSemester(year int, semester int) ([]class.ClassObjectModel, error) {
	return s.Model.GetClassesByYearSemester(year, semester)
}

func (s *ClassService) GetClassesByYearSemesterForUser(year int, semester int, userID int) ([]class.ClassObjectModel, error) {
	return s.Model.GetClassesByYearSemesterForUser(year, semester, userID)
}
