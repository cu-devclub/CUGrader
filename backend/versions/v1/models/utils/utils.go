package utils

import (
	"database/sql"

	"github.com/minio/minio-go/v7"
)

type UtilsModel struct {
	DB      *sql.DB
	JWT_KEY []byte
	Minio   *minio.Client
}
