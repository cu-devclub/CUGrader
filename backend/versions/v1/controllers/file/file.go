package file

import (
	additionalFileService "CUGrader/backend/versions/v1/services/file"
)

type AdditionalFileController struct {
	Service *additionalFileService.AdditionalFileService
}
