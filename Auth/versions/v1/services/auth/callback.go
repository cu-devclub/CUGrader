package auth

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"time"
)

func (as *AuthService) Callback(state string, code string, retrievedState interface{}) (string, error) {
	fmt.Println(state)
	fmt.Println(retrievedState)
	fmt.Println("===================================================")

	if state != retrievedState {
		return "", fmt.Errorf("invalid OAuth state")
	}

	userInfo, err := as.Model.Callback(code)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve user info: %w", err)
	}

	location, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		fmt.Println("Error loading location:", err)
		return "", fmt.Errorf("error loading location: %w", err)
	}

	plaintext := []byte(fmt.Sprintf("%s_%s_%s_%s", userInfo.Email, userInfo.Name, userInfo.Picture, time.Now().In(location).Format("2006-01-02 15:04:05")))
	oaepLabel := []byte("")
	oaepDigests := sha256.New()
	ciphertext, _ := rsa.EncryptOAEP(oaepDigests, rand.Reader, as.Model.RSAPublicKey, plaintext, oaepLabel)

	encodedCiphertext := base64.URLEncoding.EncodeToString(ciphertext)

	return encodedCiphertext, nil
}
