package question

import (
	questionModel "CUGrader/backend/versions/v1/models/question"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
)

type QuestionService struct {
	Model *questionModel.QuestionModel
	Utils *utilsModel.UtilsModel
}
