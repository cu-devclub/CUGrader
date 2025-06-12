package user

import (
	UserModel "CUGrader/backend/versions/v1/models/user"
	"crypto/rsa"
)

type UserService struct {
	Model   *UserModel.UserModel
	PrivKey *rsa.PrivateKey
	IsDev   bool
	JWT_Key []byte
}
