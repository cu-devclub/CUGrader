package student

import (
	studentService "CUGrader/backend/versions/v1/services/student"
)

type StudentController struct {
	Service *studentService.StudentService
}
