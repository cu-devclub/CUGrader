package class

import "cugrader/connection/db"

func InsertPicture(path string) (int, error) {
	var id int
	query := `INSERT INTO picture (path) VALUES ($1) RETURNING id`
	err := db.YSQL.QueryRow(query, path).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}
