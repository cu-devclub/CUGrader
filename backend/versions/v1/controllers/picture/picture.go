package picture

import (
	pictureService "CUGrader/backend/versions/v1/services/picture"
)

type PictureController struct {
	Service *pictureService.PictureService
}
