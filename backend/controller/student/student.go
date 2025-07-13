package student

type StudentInput struct {
	ClassID   int  `json:"class_id"`
	Email     int  `json:"email"`
	SectionID int  `json:"section_id"`
	GroupID   *int `json:"group_id"` // optional
}

type deleteStudentRequest struct {
	ClassID int `json:"class_id"`
	UserID  int `json:"user_id"`
}

type EditStudentRequest struct {
	ClassID   int    `json:"class_id" binding:"required"`
	StudentID int    `json:"student_id" binding:"required"`
	Section   string `json:"section,omitempty"`
	Group     string `json:"group,omitempty"`
	Withdrawn string `json:"withdrawn,omitempty"`
}
