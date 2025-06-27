package question

import (
	"database/sql"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

type QuestionModel struct {
	DB      *sql.DB
	MongoDB *mongo.Client
}

type MultilangTestcase struct {
	Input  string `json:"input"`  // Input for the test case
	Output string `json:"output"` // Expected output for the test case
}

// Intentionally duplicated struct for MongoDB usage
type TestcaseMongoModel struct {
	Input  string `bson:"input"`
	Output string `bson:"output"`
}

type QuestionEditModel struct {
	Number                  int                 `json:"number"`                    // Number of the question, used for ordering and identification
	Name                    string              `json:"name"`                      // Name of the question
	Description             string              `json:"description"`               // Description of the question
	Answer                  string              `json:"answer"`                    // Correct answer for the question
	Predefine               string              `json:"predefine"`                 // Predefined code or setup for the question
	Score                   int                 `json:"score"`                     // Score for the question
	Testcase                string              `json:"testcase"`                  // Test case for the question
	SecretTestcase          string              `json:"secret_testcase"`           // Secret test case for the question
	MultiLangTestcase       []MultilangTestcase `json:"multilang_testcase"`        // Multilingual test cases for the question
	SecretMultiLangTestcase []MultilangTestcase `json:"multilang_secret_testcase"` // Secret multilingual test cases for the question
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

type TestcaseCodeResponseModel struct {
	Testcase string `json:"testcase"` // Test case code
}

type TestcaseWithSecretModel struct {
	Testcase       []MultilangTestcase `json:"testcase"`        // Test case content
	SecretTestcase []MultilangTestcase `json:"secret_testcase"` // Secret test case content
}
