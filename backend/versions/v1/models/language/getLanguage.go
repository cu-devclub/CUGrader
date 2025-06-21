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
