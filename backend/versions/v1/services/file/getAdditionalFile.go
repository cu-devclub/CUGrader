package file

import (
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

func (s *AdditionalFileService) GetAdditionalFileByID(additionalFileID int) (string, []byte, error) {
	path, err := s.Model.GetPathByID(additionalFileID)
	if err != nil {
		return "", nil, err
	}

	path = filepath.Join(os.Getenv("FILES_PATH"), path)

	data, err := os.ReadFile(path)
	if err != nil {
		return "", nil, err
	}

	ext := filepath.Ext(path)
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		contentType = http.DetectContentType(data)
	}

	return contentType, data, nil
}
