package nearduedate

// GetLabsNearDueDate returns lab list with near due date logic
func (m *NearduedateModel) GetAllLabsNearDueDate() ([]NearDueDate, error) {
	query := `
    SELECT 
        c.course_id,
        c.course_name,
        l.id AS lab_id,
        l.name AS lab_name,
        l.due AS lab_due,
        COALESCE(SUM(q.score), 0) AS lab_max_score
    FROM lab l
    JOIN class c ON l.class_id = c.id
    LEFT JOIN question q ON l.id = q.lab_id
    WHERE l.due > NOW()
      AND l.due <= NOW() + INTERVAL '7 days'
    GROUP BY c.course_id, c.course_name, l.id, l.name, l.due
    ORDER BY l.due ASC;
    `
	rows, err := m.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var labs []NearDueDate
	for rows.Next() {
		var lab NearDueDate
		if err := rows.Scan(&lab.CourseID, &lab.CourseName, &lab.LabID, &lab.LabName, &lab.LabDue, &lab.LabMaxScore); err != nil {
			return nil, err
		}
		labs = append(labs, lab)
	}
	return labs, nil
}
