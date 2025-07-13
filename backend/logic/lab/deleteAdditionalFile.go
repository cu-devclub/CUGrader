package lab

import (
	"cugrader/repository/lab"
	"os"
	"path/filepath"
)

// AdditionalFileService provides methods to manage additional files.
func DeleteAdditionalFileByID(additionalFileID int) error {
	// Get the file path from the database
	path, err := lab.GetPathByID(additionalFileID)
	if err != nil {
		return err
	}

	// Delete the file from the filesystem
	path = filepath.Join(os.Getenv("FILES_PATH"), path)

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
