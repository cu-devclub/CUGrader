package student

import student "CUGrader/backend/versions/v1/models/student"

func (s *StudentService) GetStudentsByClassID(classID int) ([]student.StudentInfo, error) {
	return s.Model.GetByClassID(classID)
}
