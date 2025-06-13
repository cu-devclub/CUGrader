package picture

func (m *PictureModel) GetPathByID(pictureID int) (string, error) {
	var path string
	err := m.DB.QueryRow("SELECT path FROM picture WHERE id = $1", pictureID).Scan(&path)
	if err != nil {
		return "", err
	}
	return path, nil
}
