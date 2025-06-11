package class

func (m *ClassModel) GetSections(classId int) ([]int, error) {
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
