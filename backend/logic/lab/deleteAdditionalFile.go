package lab

import (
	"cugrader/connection/config"
	"cugrader/repository/lab"
	"os"
	"path/filepath"
)

// AdditionalFileService provides methods to manage additional files.
func DeleteAdditionalFileByID(additionalFileID int) error {
	// Get the file path from the database
	path, _, err := lab.GetPathByID(additionalFileID)
	if err != nil {
		return err
	}

	// Delete the file from the filesystem
	path = filepath.Join(config.Path, path)

	// Delete the file from the database
	err = lab.DeleteAdditionalFileByID(additionalFileID)
	if err != nil {
		return err
	}

	err = os.Remove(path)
	if err != nil {
		return err
	}

	return nil
}
