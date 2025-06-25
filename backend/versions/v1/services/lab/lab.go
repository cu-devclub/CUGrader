package lab

import (
	additionalFileModel "CUGrader/backend/versions/v1/models/file"
	labModel "CUGrader/backend/versions/v1/models/lab"
	languageModel "CUGrader/backend/versions/v1/models/language"
	questionModel "CUGrader/backend/versions/v1/models/question"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type LabService struct {
	Model               *labModel.LabModel
	QuestionModel       *questionModel.QuestionModel
	LanguageModel       *languageModel.LanguageModel
	AdditionalFileModel *additionalFileModel.AdditionalFileModel
	Utils               *utilsModel.UtilsModel
}
