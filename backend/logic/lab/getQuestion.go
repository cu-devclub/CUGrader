package lab

import (
	"cugrader/repository/lab"
	"cugrader/repository/submission"
	"cugrader/repository/utils"
)

func GetQuestionByIDForStudent(questionId int, UserId int) (*lab.QuestionStudentResponseModel, error) {
	question, err := lab.GetQuestionByID(questionId)
	if err != nil {
		return nil, err
	}
	if question == nil {
		return nil, nil // No question found
	}

	SubmissionId := submission.GetSubmissionId(questionId, UserId)
	// TODO(ptsgrn): Create Submission Model
	// Dummy submission model for now
	submission := lab.QuestionStudentSubmissionModel{
		Score:        0,
		Timestamp:    "",
		SubmissionID: SubmissionId,
	}

	testcase, err := lab.GetTestcaseByQuestionID(questionId)
	if err != nil {
		return nil, err
	}

	predefine, err := utils.GetCodeContent(question.Predefine)
	if err != nil {
		return nil, err
	}

	questionResponse := &lab.QuestionStudentResponseModel{
		Number:         question.Number,
		Name:           question.Name,
		Description:    question.Description,
		Predefine:      predefine,
		MaxScore:       question.Score,
		Testcase:       &testcase.TestcaseObjectID,
		SecretTestcase: &testcase.SecretTestcaseObjectID,
		Submission:     submission,
	}

	return questionResponse, nil
}

func GetQuestionByIDForInstructor(questionId int) (*lab.QuestionFullModel, error) {
	return lab.GetQuestionByID(questionId)
}

func GetMultilangTestcaseByQuestionID(questionID int, isGetSecretTestcase bool) (*lab.TestcaseWithSecretModel, error) {
	return lab.GetMultilangTestcaseCodeByQuestionID(questionID, isGetSecretTestcase)
}
