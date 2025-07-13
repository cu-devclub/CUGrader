package language

import (
	languageModel "CUGrader/backend/versions/v1/models/language"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type LanguageService struct {
	Model *languageModel.LanguageModel
	Utils *utilsModel.UtilsModel
}
