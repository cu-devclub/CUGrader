package language

func (m *LanguageModel) GetAllLanguages() ([]Language, error) {
	rows, err := m.DB.Query("SELECT id, name FROM system_language ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var languages []Language
	for rows.Next() {
		var lang Language
		if err := rows.Scan(&lang.ID, &lang.Name); err != nil {
			return nil, err
		}
		languages = append(languages, lang)
	}

	return languages, nil
}

// GetLanguageNameByLabId retrieves the names of languages associated with a specific lab ID.
// It returns a slice of language names or an error if the query fails.
func (m *LanguageModel) GetLanguageNameByLabId(labId int) ([]string, error) {
	query := `SELECT 
		sl.name
	FROM lab_language ll
	LEFT JOIN system_language sl on ll.system_language_id = sl.id
	WHERE ll.lab_id = $1`

	rows, err := m.DB.Query(query, labId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var languages []string
	for rows.Next() {
		var language string
		if err := rows.Scan(&language); err != nil {
			return nil, err
		}
		languages = append(languages, language)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return languages, nil
}
