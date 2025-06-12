package student

import (
	studentModel "CUGrader/backend/versions/v1/models/student"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type StudentService struct {
	Model *studentModel.StudentModel
	Utils *utilsModel.UtilsModel
}
