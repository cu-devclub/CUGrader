package question

import (
	questionService "CUGrader/backend/versions/v1/services/question"
)

type QuestionController struct {
	Service *questionService.QuestionService
}
