package user

import (
	UserService "CUGrader/backend/versions/v1/services/user"
)

type UserController struct {
	Service *UserService.UserService
	IsDev   bool
}
