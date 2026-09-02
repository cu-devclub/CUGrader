package auth

import "github.com/google/uuid"

func (as *AuthService) Login() (string, string) {
	state := uuid.New().String()

	url := as.Model.Login(state)
	return state, url
}
