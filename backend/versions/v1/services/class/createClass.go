package class

func (s *ClassService) CreateClass(courseID int, name string, semester int, year int, pictureID *int, creatorUserID int) (int, error) {
	// TODO: Implement JWT verification here (must be teacher or admin)

	return s.Model.Insert(courseID, name, semester, year, pictureID, creatorUserID)
}
