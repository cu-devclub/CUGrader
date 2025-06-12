package class

func (m *ClassModel) GetAllSemesters() ([]SemesterModel, error) {
	var semesters []SemesterModel
	rows, err := m.DB.Query(`
	  SELECT DISTINCT
		  year,
			semester
		FROM
			class
		ORDER BY year ASC, semester ASC;
		`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var s SemesterModel
		if err := rows.Scan(&s.Year, &s.Semester); err != nil {
			return nil, err
		}
		semesters = append(semesters, s)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return semesters, nil
}

func (m *ClassModel) GetSemstersForUser(userId int) ([]SemesterModel, error) {
	var semester []SemesterModel
	rows, err := m.DB.Query(`
		SELECT DISTINCT
			cl.year "year",
			cl.semester "semester"
		FROM class cl
			LEFT JOIN class_student cs ON cl.id = cs.class_id
			LEFT JOIN class_assistant ca ON cl.id = ca.class_id
		WHERE
			cs.user_id = $1
			OR ca.user_id = $1
		ORDER BY cl.year ASC, cl.semester ASC;
		`, userId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var s SemesterModel
		if err := rows.Scan(&s.Year, &s.Semester); err != nil {
			return nil, err
		}
		semester = append(semester, s)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return semester, nil
}
