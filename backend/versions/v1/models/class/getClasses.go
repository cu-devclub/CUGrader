package class

func (m *ClassModel) GetClassByYearSemester(year int, semester int) ([]ClassObjectModel, error) {
	query := `
		SELECT 
			c.id, 
			c.course_id, 
			c.name, 
			c.picture_id
	FROM 
			class c
	WHERE 
			c.semester = ? 
			AND c.year = ?;`

	rows, err := m.DB.Query(query, semester, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var classes []ClassObjectModel
	for rows.Next() {
		var class ClassObjectModel
		if err := rows.Scan(&class.ClassID, &class.CourseID, &class.CourseName, &class.Image); err != nil {
			return nil, err
		}
		classes = append(classes, class)
	}
	return classes, nil
}
