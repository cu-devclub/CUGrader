package assistant

import (
	assistantModel "CUGrader/backend/versions/v1/models/assistant"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type AssistantService struct {
	Model *assistantModel.AssistantModel
	Utils *utilsModel.UtilsModel
}
