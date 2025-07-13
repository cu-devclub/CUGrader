package file

import (
	"os"
	"path/filepath"
)

// AdditionalFileService provides methods to manage additional files.
func (s *AdditionalFileService) DeleteAdditionalFileByID(additionalFileID int) error {
	// Get the file path from the database
	path, err := s.Model.GetPathByID(additionalFileID)
	if err != nil {
		return err
	}

	// Delete the file from the filesystem
	path = filepath.Join(os.Getenv("FILES_PATH"), path)

	// Delete the file from the database
	err = s.Model.DeleteAdditionalFileByID(additionalFileID)
	if err != nil {
		return err
	}

	err = os.Remove(path)
	if err != nil {
		return err
	}

	return nil
}
