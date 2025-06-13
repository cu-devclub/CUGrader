package utils

import (
	"database/sql"
)

type UtilsModel struct {
	DB      *sql.DB
	JWT_KEY []byte
}
