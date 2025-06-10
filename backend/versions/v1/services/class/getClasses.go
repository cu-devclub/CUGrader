package class

import "CUGrader/backend/versions/v1/models/class"

func (s *ClassService) GetClassByYearSemester(year int, semester int) ([]class.ClassObjectModel, error) {
	// TODO: Maybe return image instead of picture_id
	return s.Model.GetClassByYearSemester(year, semester)
}
