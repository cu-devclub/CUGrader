package auth

import (
	AuthService "CUGrader/Auth/versions/v1/services/auth"
)

type AuthController struct {
	Service *AuthService.AuthService
}
