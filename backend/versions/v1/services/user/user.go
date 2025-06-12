package user

import (
	UserModel "CUGrader/backend/versions/v1/models/user"
	"crypto/rsa"

	"github.com/golang-jwt/jwt/v4"
)

type UserService struct {
	Model   *UserModel.UserModel
	PrivKey *rsa.PrivateKey
	IsDev   bool
	JWT_Key []byte
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
