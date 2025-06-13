package class

import (
	classService "CUGrader/backend/versions/v1/services/class"
)

type ClassController struct {
	Service *classService.ClassService
}
