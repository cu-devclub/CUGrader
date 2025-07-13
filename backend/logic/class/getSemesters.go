package class

import (
	"cugrader/repository/class"
	"fmt"
)

func formatSemesters(semesters []class.SemesterModel) ([]string, error) {
	if len(semesters) == 0 {
		return []string{}, nil
	}
	result := make([]string, len(semesters))
	for i, semester := range semesters {
		result[i] = fmt.Sprintf("%d-%d", semester.Year, semester.Semester)
	}
	return result, nil
}

func GetSemestersForUser(userId int) ([]string, error) {
	semesters, err := class.GetSemstersForUser(userId)
	if err != nil {
		return nil, err
	}

	return formatSemesters(semesters)
}

func GetAllSemesters() ([]string, error) {
	semesters, err := class.GetAllSemesters()
	if err != nil {
		return nil, err
	}
	return formatSemesters(semesters)
}
