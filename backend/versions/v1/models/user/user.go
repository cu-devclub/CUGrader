package user

import "database/sql"

type UserModel struct {
	DB *sql.DB
}
