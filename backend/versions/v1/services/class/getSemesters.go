package class

import (
	classModel "CUGrader/backend/versions/v1/models/class"
	"fmt"
)

func formatSemesters(semesters []classModel.SemesterModel) ([]string, error) {
	result := make([]string, len(semesters))
	for i, semester := range semesters {
		result[i] = fmt.Sprintf("%d-%d", semester.Year, semester.Semester)
	}
	return result, nil
}

func (s *ClassService) GetSemester(userId int) ([]string, error) {
	semesters, err := s.Model.GetSemstersForUser(userId)
	if err != nil {
		return nil, err
	}

	return formatSemesters(semesters)
}

func (s *ClassService) GetAllSemesters() ([]string, error) {
	semesters, err := s.Model.GetAllSemesters()
	if err != nil {
		return nil, err
	}
	return formatSemesters(semesters)
}
