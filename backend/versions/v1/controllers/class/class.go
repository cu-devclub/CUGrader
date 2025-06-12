package class

import (
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	classService "CUGrader/backend/versions/v1/services/class"
)

type ClassController struct {
	Service *classService.ClassService
	Utils   *utilsModel.UtilsModel
}
