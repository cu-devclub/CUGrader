package auth

import (
	"crypto/rsa"

	"golang.org/x/oauth2"
)

type AuthModel struct {
	GoogleOauth  *oauth2.Config
	RSAPublicKey *rsa.PublicKey
}
