package class

func (m *ClassModel) Insert(courseID int, name string, semester int, year int, pictureID *int, creatorUserID int) (int, error) {
	var id int
	query := `
		INSERT INTO "class" (course_id, name, semester, year, picture_id, creater_user_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`
	err := m.DB.QueryRow(query, courseID, name, semester, year, pictureID, creatorUserID).Scan(&id)
	return id, err
}
