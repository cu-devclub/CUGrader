package lab

import (
	questionModel "CUGrader/backend/versions/v1/models/question"
	"database/sql"
	"time"
)

type LabModel struct {
	DB *sql.DB
}

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

type LabEditModel struct {
	Number          *int                              `json:"number"`             // Number of the lab, used for ordering and identification
	Name            *string                           `json:"name"`               // Name of the lab
	Publish         *string                           `json:"publish"`            // Publish date for the lab in RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	Due             *string                           `json:"due"`                // Due date for the lab in RFC3339 format (e.g., "1996-12-19T16:39:57+07:00")
	CloseOnDue      *bool                             `json:"close_on_due"`       // Whether to close (not allow submissions) the lab when it is due
	ExamMode        *bool                             `json:"exam_mode"`          // Whether this lab is in exam mode
	ShowScoreOnLock *bool                             `json:"show_score_on_lock"` // ? idk no idea lmao
	AssignTo        []string                          `json:"assign_to"`          // List of groups assigned this lab to
	ExamPin         *string                           `json:"exam_pin,omitempty"` // Optional, only used in exam mode
	Testcase        *string                           `json:"testcase"`           // Object ID for the main test cases
	SecretTestcase  *string                           `json:"secret_testcase"`    // Object ID for the secret test cases
	Questions       []questionModel.QuestionEditModel `json:"questions"`          // List of questions associated with this lab
}
