package assistant

import (
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	assistantService "CUGrader/backend/versions/v1/services/assistant"
)

type AssistantController struct {
	Service *assistantService.AssistantService
	Utils   *utilsModel.UtilsModel
}
