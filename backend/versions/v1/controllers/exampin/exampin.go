package exampin

import (
	pinService "CUGrader/backend/versions/v1/services/exampin"
)

type PinController struct {
	Service *pinService.PinService
}
