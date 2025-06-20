package file

import (
	fileModel "CUGrader/backend/versions/v1/models/file"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type AdditionalFileService struct {
	Model *fileModel.AdditionalFileModel
	Utils *utilsModel.UtilsModel
}
