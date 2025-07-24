package submission

import (
	"cugrader/repository/submission"
	submissionStruct "cugrader/structure/submission"
)

//	type QueueData struct {
//		TimeOut                 int          `json:"timeout_seconds"`
//		QuestionId              int          `json:"question_id"`
//		SubmissionId            int          `json:"submission_id"`
//		Codes                   []CodeStruct `json:"codes"`
//		Multilang               bool         `json:"is_multilang"`
//		TestcaseId              int          `json:"testcase_id"`
//		Testcase                string       `json:"testcase"`
//		SecretTestcase          string       `json:"secret_testcase"`
//		MultilangTestcase       []Mulitlang  `json:"multilang_testcase"`
//		SecretMultilangTestcase []Mulitlang  `json:"multilang_secret_testcase"`
//		AddiftionalFiles        []struct {
//			Filename string `json:"filename"`
//			Content  string `json:"content"`
//		} `json:"addition_files"`
//		Score int `json:"score"`
//	}
func GradeUsersCode(SubmissionId int) error {
	SQInfo, err := submission.LoadSubmissionQuestionInfo(SubmissionId)
	if err != nil {
		return err
	}

	QueueData := submissionStruct.QueueData{
		TimeOut:                 10,
		QuestionId:              SQInfo.QuestionId,
		SubmissionId:            SubmissionId,
		Codes:                   SQInfo.Codes,
		Multilang:               false,
		TestcaseId:              SQInfo.TestcaseId,
		Testcase:                SQInfo.Testcase,
		SecretTestcase:          SQInfo.SecretTestcase,
		MultilangTestcase:       []submissionStruct.Mulitlang{},
		SecretMultilangTestcase: []submissionStruct.Mulitlang{},
		AdditionalFiles:         SQInfo.AdditionalFiles,
		Score:                   SQInfo.Score,
	}

	err = submission.AppendToQueue(SQInfo.Channel, QueueData)
	if err != nil {
		return err
	}

	return nil
}
