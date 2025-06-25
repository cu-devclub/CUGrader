package language

import (
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	languageService "CUGrader/backend/versions/v1/services/language"
)

type LanguageController struct {
	Service *languageService.LanguageService
	Utils   *utilsModel.UtilsModel
}
