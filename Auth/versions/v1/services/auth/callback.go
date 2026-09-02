package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"time"
)

func (as *AuthService) Callback(state string, code string, retrievedState interface{}) (string, string, error) {
	if state != retrievedState {
		return "", "", fmt.Errorf("invalid OAuth state")
	}

	userInfo, err := as.Model.Callback(code)
	if err != nil {
		return "", "", fmt.Errorf("failed to retrieve user info: %w", err)
	}

	location, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		fmt.Println("Error loading location:", err)
		return "", "", fmt.Errorf("error loading location: %w", err)
	}

	plaintext := []byte(fmt.Sprintf("%s_%s_%s_%s",
		userInfo.Email,
		userInfo.Name,
		userInfo.Picture,
		time.Now().In(location).Format("2006-01-02 15:04:05"),
	))

	// 1. Generate AES key
	aesKey := make([]byte, 32) // AES-256
	_, err = rand.Read(aesKey)
	if err != nil {
		return "", "", fmt.Errorf("AES key generation error: %w", err)
	}

	// 2. Encrypt plaintext with AES-GCM
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return "", "", fmt.Errorf("AES cipher error: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", "", fmt.Errorf("AES GCM error: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	_, err = rand.Read(nonce)
	if err != nil {
		return "", "", fmt.Errorf("nonce error: %s", err)
	}

	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)

	// 3. Encrypt AES key with RSA
	oaepLabel := []byte("")
	oaepDigest := sha256.New()
	encryptedAESKey, err := rsa.EncryptOAEP(oaepDigest, rand.Reader, as.Model.RSAPublicKey, aesKey, oaepLabel)
	if err != nil {
		return "", "", fmt.Errorf("RSA encryption error: %w", err)
	}

	// 4. Encode both parts to base64
	encodedKey := base64.URLEncoding.EncodeToString(encryptedAESKey)
	encodedData := base64.URLEncoding.EncodeToString(ciphertext)

	return encodedKey, encodedData, nil
}
