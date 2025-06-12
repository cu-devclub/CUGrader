package student

type StudentInput struct {
	ClassID   int  `json:"class_id"`
	UserID    int  `json:"user_id"`
	SectionID int  `json:"section_id"`
	GroupID   *int `json:"group_id"` // optional
}

func (s *StudentService) AddStudent(input StudentInput) error {
	// Optionally: validate JWT / check role here
	return s.Model.Add(input.ClassID, input.UserID, input.SectionID, input.GroupID)
}
