package auth

import (
	"context"
	"fmt"

	"google.golang.org/api/oauth2/v1"
	"google.golang.org/api/option"
)

func (am *AuthModel) Callback(code string) (*oauth2.Userinfoplus, error) {
	token, err := am.GoogleOauth.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %w", err)
	}

	client := am.GoogleOauth.Client(context.Background(), token)
	oauth2Service, err := oauth2.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("failed to create OAuth2 service: %w", err)
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}

	return userInfo, nil
}
