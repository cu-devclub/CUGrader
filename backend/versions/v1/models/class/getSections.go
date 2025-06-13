package class

func (m *ClassModel) GetAllSections(classId int) ([]int, error) {
	query := `
		SELECT
		  section_number
		FROM
			section
		WHERE
			class_id = $1	
	`

	rows, err := m.DB.Query(query, classId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []int
	for rows.Next() {
		var section int
		if err := rows.Scan(&section); err != nil {
			return nil, err
		}
		sections = append(sections, section)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return sections, nil
}

func (m *ClassModel) GetSectionsForUser(classId int, userId int) ([]int, error) {
	query := `
	SELECT 
   	s.section_number
	FROM 
		section s
	JOIN class c ON s.class_id = c.id
	JOIN class_student cs ON s.class_id = cs.class_id
	JOIN class_assistant ca ON s.class_id = ca.class_id
	WHERE 
		s.class_id = $1 AND (cs.user_id = $2 OR ca.user_id = $2);
	`

	rows, err := m.DB.Query(query, classId, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var sections []int
	for rows.Next() {
		var section int
		if err := rows.Scan(&section); err != nil {
			return nil, err
		}
		sections = append(sections, section)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return sections, nil
}
