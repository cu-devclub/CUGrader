package student

type StudentInput struct {
	ClassID int    `json:"ClassId"`
	Email   string `json:"email"`
	Section int    `json:"section"`
	Group   string `json:"group"`
}

type EditStudentRequest struct {
	StudentID  int    `json:"StudentId" binding:"required"`
	Section    *int   `json:"section,omitempty"`
	Group      string `json:"group,omitempty"`
	Withdrawal *bool  `json:"withdrawal,omitempty"`
}
