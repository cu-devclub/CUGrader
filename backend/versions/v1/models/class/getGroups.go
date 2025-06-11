package class

func (m *ClassModel) GetGroups(classId int) ([]string, error) {
	query := `
		SELECT
			group_name
		FROM 
			"group" 
		WHERE "group".class_id = $1;	
	`
	rows, err := m.DB.Query(query, classId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []string
	for rows.Next() {
		var group string
		if err := rows.Scan(&group); err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return groups, nil
}
