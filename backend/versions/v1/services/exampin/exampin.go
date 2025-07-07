package exampin

import (
	pinModel "CUGrader/backend/versions/v1/models/exampin"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type PinService struct {
	Model *pinModel.PinModel
	Utils *utilsModel.UtilsModel
}
