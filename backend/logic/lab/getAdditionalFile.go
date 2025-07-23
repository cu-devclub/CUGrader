package lab

import (
	"cugrader/connection/config"
	"cugrader/repository/lab"
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

func GetAdditionalFileByID(additionalFileID int) (string, []byte, error) {
	path, err := lab.GetPathByID(additionalFileID)
	if err != nil {
		return "", nil, err
	}

	path = filepath.Join(config.Path, path)

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
