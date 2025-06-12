package assistant

import (
	assistantService "CUGrader/backend/versions/v1/services/assistant"
)

type AssistantController struct {
	Service *assistantService.AssistantService
}
