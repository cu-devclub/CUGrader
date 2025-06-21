package lab

import (
	labModel "CUGrader/backend/versions/v1/models/lab"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type LabService struct {
	Model *labModel.LabModel
	Utils *utilsModel.UtilsModel
}
