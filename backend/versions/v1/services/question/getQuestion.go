package question

import (
	questionModel "CUGrader/backend/versions/v1/models/question"
)

func (s *QuestionService) GetQuestionByIDForStudent(questionId int) (*questionModel.QuestionStudentResponseModel, error) {
	question, err := s.Model.GetQuestionByID(questionId)
	if err != nil {
		return nil, err
	}
	if question == nil {
		return nil, nil // No question found
	}

	// TODO(ptsgrn): Create Submission Model
	// Dummy submission model for now
	submission := questionModel.QuestionStudentSubmissionModel{
		Score:        0,
		Timestamp:    "",
		SubmissionID: 0,
	}

	testcase, err := s.Model.GetTestcaseByQuestionID(questionId)
	if err != nil {
		return nil, err
	}

	questionResponse := &questionModel.QuestionStudentResponseModel{
		Number:         question.Number,
		Name:           question.Name,
		Description:    question.Description,
		Predefine:      question.Predefine,
		MaxScore:       question.Score,
		Testcase:       &testcase.TestcaseObjectID,
		SecretTestcase: &testcase.SecretTestcaseObjectID,
		Submission:     submission,
	}

	return questionResponse, nil
}
