package student

import "cugrader/repository/student"

func GetStudentsByClassID(classID int) ([]student.StudentInfo, error) {
	students, err := student.GetByClassID(classID)
	if err != nil {
		return []student.StudentInfo{}, err
	}
	if students == nil {
		return []student.StudentInfo{}, nil
	}
	return students, nil
}
