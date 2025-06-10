package class

import "fmt"

func (s *ClassService) GetSemester(userId int) ([]string, error) {
	semesters, err := s.Model.GetSemstersByUserId(userId)
	if err != nil {
		return nil, err
	}
	result := make([]string, len(semesters))
	for i, semester := range semesters {
		result[i] = fmt.Sprintf("%d-%d", semester.Year, semester.Semester)
	}
	return result, nil
}
