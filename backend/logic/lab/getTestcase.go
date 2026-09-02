package lab

import "cugrader/repository/lab"

func GetTestcaseCodeByTestcaseID(testCaseId int, withSecret bool) (*lab.TestcaseCodeResponseModel, error) {
	testcase, err := lab.GetTestcaseCodeByTestcaseID(testCaseId)
	if err != nil {
		return nil, err
	}

	if testcase == nil {
		// No testcase found, return empty response
		return &lab.TestcaseCodeResponseModel{
			Testcase:       "",
			SecretTestcase: "",
		}, nil
	}

	if !withSecret {
		testcase.SecretTestcase = ""
	}

	return testcase, nil
}
