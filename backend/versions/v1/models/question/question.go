package question

import "database/sql"

type QuestionModel struct {
	DB *sql.DB
}

type QuestionStudentSubmissionModel struct {
	Score        int    `json:"score"`         // score for the submission
	Timestamp    string `json:"timestamp"`     // timestamp of the submission in RFC3339 format (e.g., "2023-10-01T12:00:00+00:00")
	SubmissionID int    `json:"submission_id"` // unique identifier for the submission
}

type QuestionStudentResponseModel struct {
	Number         int                            `json:"number"`          // question number
	Name           string                         `json:"name"`            // question name
	Description    string                         `json:"description"`     // question content in markdown format
	Predefine      string                         `json:"predefine"`       // pre-filled code for the question
	MaxScore       int                            `json:"max_score"`       // maximum score for the question
	Testcase       *string                        `json:"testcase"`        // testcase_id primary key, null if multilanguage
	SecretTestcase *string                        `json:"secret_testcase"` // Secret testcase_id primary key, null if multilanguage
	Submission     QuestionStudentSubmissionModel `json:"submissions"`     //
}

type QuestionFullModel struct {
	ID                     int    `json:"id"`                        // question ID
	LabID                  int    `json:"lab_id"`                    // lab ID associated with the question
	Number                 int    `json:"number"`                    // question number
	Name                   string `json:"name"`                      // question name
	Score                  int    `json:"score"`                     // maximum score for the question
	Description            string `json:"description"`               // question content in markdown format
	Answer                 string `json:"answer"`                    // answer to the question
	Predefine              string `json:"predefine"`                 // pre-filled code for the question
	TestcaseObjectID       string `json:"testcase_object_id"`        // testcase_id primary key, null if multilanguage
	SecretTestcaseObjectID string `json:"secret_testcase_object_id"` // Secret testcase_id primary key, null if multilanguage
}

type TestcaseModel struct {
	ID                     int    `json:"id"`                 // unique identifier for the testcase
	TestcaseObjectID       string `json:"testcase_object_id"` // testcase_id primary key, null if multilanguage
	SecretTestcaseObjectID string `json:"secret_testcase_id"`
}
