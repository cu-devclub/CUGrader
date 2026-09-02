package lab

import "cugrader/connection/db"

func DeleteAdditionalFileByID(additionalFileID int) error {
	_, err := db.YSQL.Exec("DELETE FROM addition_files WHERE id = $1", additionalFileID)
	return err
}
