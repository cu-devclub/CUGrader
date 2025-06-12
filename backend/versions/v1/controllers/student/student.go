package student

import (
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	studentService "CUGrader/backend/versions/v1/services/student"
)

type StudentController struct {
	Service *studentService.StudentService
	Utils   *utilsModel.UtilsModel
}
