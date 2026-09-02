package auth

func (am *AuthModel) Login(state string) string {
	url := am.GoogleOauth.AuthCodeURL(state)
	return url
}
