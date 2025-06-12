package utils

import (
	"errors"

	"github.com/golang-jwt/jwt/v4"
)

type JWTCustomClaims struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Email     string `json:"email"`
	UserID    int    `json:"user_id"`
	Profile   string `json:"profile"`
	Role      string `json:"role"`
	jwt.RegisteredClaims
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
