package lab

import "time"

type multilang_testcase struct {
	Input  string `json:"input" binding:"required"`
	Output string `json:"output" binding:"required"`
}

type QuestionData struct {
	QuestionNumber          int                  `json:"number" binding:"required"`
	Name                    string               `json:"name" binding:"required"`
	Description             string               `json:"description" binding:"required"`
	Answer                  string               `json:"answer" binding:"required"`
	Predefine               string               `json:"predefine" binding:"required"`
	Score                   int                  `json:"score" binding:"required"`
	Testcase                string               `json:"testcase" binding:"required"`
	SecretTestcase          string               `json:"secret_testcase" binding:"required"`
	MultilangTestcase       []multilang_testcase `json:"multilang_testcase" binding:"required"`
	MultilangSecretTestcase []multilang_testcase `json:"multilang_secret_testcase" binding:"required"`
}

type LabData struct {
	LabNumber       int            `json:"number" binding:"required"`
	Name            string         `json:"name" binding:"required"`
	PublishDate     time.Time      `json:"publish" time_format:"2006-01-02T15:04:05Z07:00"`
	DueDate         time.Time      `json:"due" time_format:"2006-01-02T15:04:05Z07:00"`
	LanguageIds     []int          `json:"language_ids" binding:"required"`
	CloseOnDue      bool           `json:"close_on_due" binding:"required"`
	ExamMode        bool           `json:"exam_mode" binding:"required"`
	ShowScoreOnLock bool           `json:"show_score_on_lock" binding:"required"`
	AssignTo        []string       `json:"assign_to" binding:"required"`
	ExamPin         *int           `json:"exam_pin" binding:"required"`
	Testcase        string         `json:"testcase" binding:"required"`
	SecretTestcase  string         `json:"secret_testcase" binding:"required"`
	Questions       []QuestionData `json:"questions" binding:"required"`
	Description     string         `json:"description" binding:"required"`
	LabScore        int            `json:"score" binding:"required"`
}

type AddLab struct {
	ClassID int     `json:"ClassId" binding:"required"`
	LabData LabData `json:"lab_data" binding:"required"`
}

type EditQuestionData struct {
	QuestionId              int                   `json:"QuestionId" binding:"required"`
	QuestionNumber          *int                  `json:"number,omitempty"`
	Name                    *string               `json:"name,omitempty"`
	Description             *string               `json:"description,omitempty"`
	Answer                  *string               `json:"answer,omitempty"`
	Predefine               *string               `json:"predefine,omitempty"`
	Score                   *int                  `json:"score,omitempty"`
	Testcase                *string               `json:"testcase,omitempty"`
	SecretTestcase          *string               `json:"secret_testcase,omitempty"`
	MultilangTestcase       *[]multilang_testcase `json:"multilang_testcase,omitempty"`
	MultilangSecretTestcase *[]multilang_testcase `json:"multilang_secret_testcase,omitempty"`
}

type EditLabData struct {
	LabNumber       *int                `json:"number,omitempty"`
	Name            *string             `json:"name,omitempty"`
	PublishDate     *time.Time          `json:"publish" time_format:"2006-01-02T15:04:05Z07:00"`
	DueDate         *time.Time          `json:"due" time_format:"2006-01-02T15:04:05Z07:00"`
	LanguageIds     *[]int              `json:"language_ids,omitempty"`
	CloseOnDue      *bool               `json:"close_on_due,omitempty"`
	ExamMode        *bool               `json:"exam_mode,omitempty"`
	ShowScoreOnLock *bool               `json:"show_score_on_lock,omitempty"`
	AssignTo        *[]string           `json:"assign_to,omitempty"`
	ExamPin         *int                `json:"exam_pin,omitempty"`
	Testcase        *string             `json:"testcase,omitempty"`
	SecretTestcase  *string             `json:"secret_testcase,omitempty"`
	Questions       *[]EditQuestionData `json:"questions,omitempty"`
	Description     *string             `json:"description,omitempty"`
	LabScore        *int                `json:"score,omitempty"`
}

type EditLab struct {
	LabID   int         `json:"ClassId" binding:"required"`
	LabData EditLabData `json:"lab_data" binding:"required"`
}
