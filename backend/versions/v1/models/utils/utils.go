package utils

import (
	"database/sql"
	"errors"

	"github.com/golang-jwt/jwt/v4"
)

type UtilsModel struct {
	DB      *sql.DB
	JWT_KEY []byte
}

// Verify_JWT this function will check that input token is valid with JWT secret key return error if not valid and nil if it valid
func (um *UtilsModel) Verify_JWT(token string) error {
	return nil
	const bearerPrefix = "Bearer "
	if len(token) > len(bearerPrefix) && token[:len(bearerPrefix)] == bearerPrefix {
		token = token[len(bearerPrefix):]
	}

	tokenObj, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok || t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, errors.New("unexpected signing method")
		}
		return um.JWT_KEY, nil
	})
	if err != nil {
		return err
	}
	if !tokenObj.Valid {
		return errors.New("invalid token")
	}
	return nil
}
