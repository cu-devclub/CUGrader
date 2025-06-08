package auth

import (
	"context"
	"fmt"

	oauth2Service "google.golang.org/api/oauth2/v2"
)

func (am *AuthModel) Callback(code string) (*oauth2Service.Userinfo, error) {

	token, err := am.GoogleOauth.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %w", err)
	}

	client := am.GoogleOauth.Client(context.Background(), token)
	oauth2Service, err := oauth2Service.New(client)
	if err != nil {
		return nil, fmt.Errorf("Failed to create OAuth2 service: %w", err)
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		return nil, fmt.Errorf("Failed to get user info: %w", err)
	}

	return userInfo, nil
}
