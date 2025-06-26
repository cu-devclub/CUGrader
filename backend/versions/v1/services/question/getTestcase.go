package question

import (
	questionModel "CUGrader/backend/versions/v1/models/question"
)

func (s *QuestionService) GetTestcaseCodeByTestcaseID(questionId int) (*questionModel.TestcaseCodeResponseModel, error) {
	testcase, err := s.Model.GetTestcaseByQuestionID(questionId)
	if err != nil {
		return nil, err
	}

	if testcase == nil {
		// No testcase found, return empty response
		return &questionModel.TestcaseCodeResponseModel{
			Testcase: "",
		}, nil
	}
	testcaseCodeResponse := &questionModel.TestcaseCodeResponseModel{
		Testcase: testcase.TestcaseObjectID,
	}

	return testcaseCodeResponse, nil
}
