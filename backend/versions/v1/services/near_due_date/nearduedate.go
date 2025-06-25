package nearduedate

import (
	nearduedateModel "CUGrader/backend/versions/v1/models/near_due_date"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type NearDueDateService struct {
	Model *nearduedateModel.NearDueDateModel
	Utils *utilsModel.UtilsModel
}
