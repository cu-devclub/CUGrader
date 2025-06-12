package class

func (m *ClassModel) GetAllClasses() ([]ClassObjectModel, error) {
	query := `
		SELECT 
			c.id, 
			c.course_id, 
			c.name, 
			c.picture_id
		FROM 
				class c;
	`

	rows, err := m.DB.Query(query)
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

func (m *ClassModel) GetAllClassesForUser(userID int) ([]ClassObjectModel, error) {
	query := `
		SELECT 
			c.id, 
			c.course_id, 
			c.name, 
			c.picture_id
		FROM
				class c
		JOIN class_student cs ON c.id = cs.class_id
		WHERE 
				cs.user_id = ?;
	`

	rows, err := m.DB.Query(query, userID)
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

func (m *ClassModel) GetClassesByYearSemester(year int, semester int) ([]ClassObjectModel, error) {
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
				AND c.year = ?;
	`

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

func (m *ClassModel) GetClassesByYearSemesterForUser(year int, semester int, userID int) ([]ClassObjectModel, error) {
	query := `
		SELECT 
			cl.id,
			cl.course_id,
			cl.name,
			cl.picture_id
    FROM class cl
    JOIN class_student cs ON cl.id = cs.class_id
    JOIN class_assistant ca ON cl.id = ca.class_id
    WHERE 
        (cs.user_id = $1 OR ca.user_id = $1)
        AND (cl.year = $2 AND cl.semester = $3)
    ORDER BY cl.year ASC, cl.semester ASC;
	`
	rows, err := m.DB.Query(query, userID, year, semester)
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
