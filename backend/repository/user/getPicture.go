package user

import "cugrader/connection/db"

func GetPathByID(pictureID int) (string, error) {
	var path string
	err := db.YSQL.QueryRow("SELECT path FROM picture WHERE id = $1", pictureID).Scan(&path)
	if err != nil {
		return "", err
	}
	return path, nil
}
