package nearduedate

import (
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	nearduedateService "CUGrader/backend/versions/v1/services/near_due_date"
)

type NearDueDateController struct {
	Service *nearduedateService.NearDueDateService
	Utils   *utilsModel.UtilsModel
}
