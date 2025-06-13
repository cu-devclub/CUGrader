package student

import student "CUGrader/backend/versions/v1/models/student"

func (s *StudentService) GetStudentsByClassID(classID int) ([]student.StudentInfo, error) {
	students, err := s.Model.GetByClassID(classID)
	if err != nil {
		return []student.StudentInfo{}, err
	}
	if students == nil {
		return []student.StudentInfo{}, nil
	}
	return students, nil
}
