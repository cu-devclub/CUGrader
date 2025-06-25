package lab

import (
	labService "CUGrader/backend/versions/v1/services/lab"
)

type LabController struct {
	Service *labService.LabService
}
