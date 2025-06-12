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

type JWTCustomClaims struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Email     string `json:"email"`
	UserID    int    `json:"user_id"`
	Profile   string `json:"profile"`
	Role      string `json:"role"`
	jwt.RegisteredClaims
}

// Verify_JWT this function will check that input token is valid with JWT secret key return error if not valid and nil if it valid
func (um *UtilsModel) Verify_JWT(token string) error {
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

// GetJWTClaims this function will return the claims of the JWT token if it is valid, otherwise it will return an error
// It also strips the "Bearer " prefix if present.
func (um *UtilsModel) GetJWTClaims(token string) (*JWTCustomClaims, error) {
	const bearerPrefix = "Bearer "
	if len(token) > len(bearerPrefix) && token[:len(bearerPrefix)] == bearerPrefix {
		token = token[len(bearerPrefix):]
	}
	claims := &JWTCustomClaims{}
	tokenObj, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok || t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, errors.New("unexpected signing method")
		}
		return um.JWT_KEY, nil
	})
	if err != nil {
		return nil, err
	}
	if !tokenObj.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
