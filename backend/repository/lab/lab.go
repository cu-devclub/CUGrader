package lab

import "time"

type LabResponse struct {
	LabID     int       `json:"lab_id"`
	LabNumber int       `json:"lab_number"`
	LabName   string    `json:"lab_name"`
	Publish   time.Time `json:"publish"`
	Due       time.Time `json:"due"`
	Score     int       `json:"score"` // เซ็ตเป็น 0 ชั่วคราว
	MaxScore  int       `json:"max_score"`
	Status    string    `json:"status"`
}

// LabFullModel represents the full details of a lab found in the database.
// It includes all the necessary fields to describe a lab, such as its ID, class ID,
// number, name, publish and due dates, exam mode settings, and associated test cases.
type LabFullModel struct {
	ID                     int    `json:"id"`                        // Unique identifier for the lab
	ClassID                int    `json:"class_id"`                  // ID of the class this lab belongs to
	Number                 int    `json:"number"`                    // Number of the lab, used for ordering and identification
	Name                   string `json:"name"`                      // Name of the lab
	Publish                string `json:"publish"`                   // RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	Due                    string `json:"due"`                       // RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	CloseOnDue             bool   `json:"close_on_due"`              // Whether to close (not allow submissions) the lab when it is due
	ExamMode               bool   `json:"exam_mode"`                 // Whether this lab is in exam mode
	ExamPin                string `json:"exam_pin,omitempty"`        // Optional, only used in exam mode
	ShowScoreOnLock        bool   `json:"show_score_on_lock"`        // ? idk no idea lmao
	TestcaseObjectID       string `json:"testcase_object_id"`        // Object ID for the main test cases
	SecretTestcaseObjectID string `json:"secret_testcase_object_id"` // Object ID for the secret test cases
}

// LabStudentDetailModel represents the detailed information about a lab for students.
type LabStudentDetailModel struct {
	QuestionIDs     []int    `json:"question_ids"` // List of question IDs associated with this lab
	Number          int      `json:"number"`       // Number of the lab, used for ordering and identification
	Name            string   `json:"name"`         // Name of the lab
	Publish         string   `json:"publish"`      // Publish date for the lab in RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	Due             string   `json:"due"`          // Due date for the lab in RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	Language        []string `json:"language"`     // List of programming languages supported by this lab
	ExamMode        bool     `json:"exam_mode"`    // Whether this lab is in exam mode
	CloseOnDue      bool     `json:"close_on_due"` // Wheather to close (not allow submissions) the lab when it is due
	AssignTo        []string `json:"assign_to"`    // List of groups assigned this lab to
	AdditionalFiles []int    `json:"addfiles"`     // Other files associated with this lab (eg. Text file or Image), represented by their IDs
}

type LabInstructorDetailModel struct {
	LabStudentDetailModel // Embedding LabStudentDetailModel to inherit its fields

	ClassID                int    `json:"class_id"`                  // ID of the class this lab belongs to
	ExamPin                string `json:"exam_pin,omitempty"`        // Optional, only used in exam mode
	ShowScoreOnLock        bool   `json:"show_score_on_lock"`        // ? idk no idea lmao
	TestcaseObjectID       string `json:"testcase_object_id"`        // Object ID for the main test cases
	SecretTestcaseObjectID string `json:"secret_testcase_object_id"` // Object ID for the secret test cases
}

type LabEditModel struct {
	Number          *int                `json:"number"`             // Number of the lab, used for ordering and identification
	Name            *string             `json:"name"`               // Name of the lab
	Publish         *string             `json:"publish"`            // Publish date for the lab in RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	Due             *string             `json:"due"`                // Due date for the lab in RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	CloseOnDue      *bool               `json:"close_on_due"`       // Whether to close (not allow submissions) the lab when it is due
	ExamMode        *bool               `json:"exam_mode"`          // Whether this lab is in exam mode
	ShowScoreOnLock *bool               `json:"show_score_on_lock"` // ? idk no idea lmao
	AssignTo        []string            `json:"assign_to"`          // List of groups assigned this lab to
	ExamPin         *string             `json:"exam_pin,omitempty"` // Optional, only used in exam mode
	Testcase        *string             `json:"testcase"`           // Object ID for the main test cases
	SecretTestcase  *string             `json:"secret_testcase"`    // Object ID for the secret test cases
	Questions       []QuestionEditModel `json:"questions"`          // List of questions associated with this lab
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

type NearDueDate struct {
	CourseID    int       `json:"course_id"`
	CourseName  string    `json:"course_name"`
	LabID       int       `json:"lab_id"`
	LabName     string    `json:"lab_name"`
	LabDue      time.Time `json:"lab_due"`
	LabMaxScore int       `json:"lab_max_score"`
}
