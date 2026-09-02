package lab

import "cugrader/connection/db"

// GetPathByID retrieves the file path for a given additional file ID from the database.
func GetPathByID(additionalFileId int) (string, string, error) {
	var path string
	var filename string
	err := db.YSQL.QueryRow("SELECT path FROM addition_files, filename WHERE id = $1", additionalFileId).Scan(&path, &filename)
	if err != nil {
		return "", "", err
	}
	return path, filename, nil
}

// GetFileIdByLabID retrieves all additional file IDs associated with a specific lab ID.
// It returns a slice of file IDs or an error if the query fails.
func GetFileIdByLabID(labID int) ([]int, error) {
	query := `SELECT id FROM addition_files WHERE lab_id = $1`
	rows, err := db.YSQL.Query(query, labID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var fileIds []int
	for rows.Next() {
		var fileId int
		if err := rows.Scan(&fileId); err != nil {
			return nil, err
		}
		fileIds = append(fileIds, fileId)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return fileIds, nil
}
