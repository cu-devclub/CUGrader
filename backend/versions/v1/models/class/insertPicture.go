package class

func (m *ClassModel) InsertPicture(path string) (int, error) {
	var id int
	query := `INSERT INTO picture (path) VALUES ($1) RETURNING id`
	err := m.DB.QueryRow(query, path).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}
