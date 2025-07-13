package lab

import "cugrader/repository/lab"

func GetTestcaseCodeByTestcaseID(questionId int) (*lab.TestcaseCodeResponseModel, error) {
	testcase, err := lab.GetTestcaseByQuestionID(questionId)
	if err != nil {
		return nil, err
	}

	if testcase == nil {
		// No testcase found, return empty response
		return &lab.TestcaseCodeResponseModel{
			Testcase: "",
		}, nil
	}
	testcaseCodeResponse := &lab.TestcaseCodeResponseModel{
		Testcase: testcase.TestcaseObjectID,
	}

	return testcaseCodeResponse, nil
}
