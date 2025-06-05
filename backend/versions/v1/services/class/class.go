package class

import (
	classModel "CUGrader/backend/versions/v1/models/class"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type ClassService struct {
	Model *classModel.ClassModel
	Utils *utilsModel.UtilsModel
}
