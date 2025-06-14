package user

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

func rsaDecrypt(cipherText string, privKey *rsa.PrivateKey) ([]byte, error) {
	data, err := base64.URLEncoding.DecodeString(cipherText)
	if err != nil {
		return nil, err
	}
	label := []byte("")
	hash := sha256.New()
	plain, err := rsa.DecryptOAEP(hash, rand.Reader, privKey, data, label)
	if err != nil {
		return nil, err
	}
	return plain, nil
}

func aesDecrypt(cipherTextBase64, keyBase64 string) ([]byte, error) {
	cipherText, err := base64.URLEncoding.DecodeString(cipherTextBase64)
	if err != nil {
		return nil, fmt.Errorf("base64 decode cipherText: %w", err)
	}
	key, err := base64.URLEncoding.DecodeString(keyBase64)
	if err != nil {
		return nil, fmt.Errorf("base64 decode key: %w", err)
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("new cipher: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("new GCM: %w", err)
	}

	if len(cipherText) < gcm.NonceSize() {
		return nil, errors.New("ciphertext too short")
	}

	nonce := cipherText[:gcm.NonceSize()]
	cipherText = cipherText[gcm.NonceSize():]

	plainText, err := gcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return nil, fmt.Errorf("gcm open: %w", err)
	}

	return plainText, nil
}

func (us *UserService) Callback(key string, credential string) (string, int, error) {
	decryptedKey, err := rsaDecrypt(key, us.PrivKey)
	if err != nil {
		return "", 400, err
	}

	decryptedData, err := aesDecrypt(credential, base64.URLEncoding.EncodeToString(decryptedKey))
	if err != nil {
		return "", 400, err
	}
	parts := strings.SplitN(string(decryptedData), "_", 4)
	if len(parts) != 4 {
		return "", 400, errors.New("invalid decrypted data format")
	}
	email := parts[0]
	name := parts[1]
	picture := parts[2]
	datetimeStr := parts[3]
	dt, err := time.Parse("2006-01-02 15:04:05", datetimeStr)
	if err != nil {
		return "", 400, errors.New("invalid datetime format")
	}
	if time.Since(dt) > 5*time.Minute || time.Until(dt) > 5*time.Minute {
		return "", 400, errors.New("credential expires")
	}

	if !strings.HasSuffix(email, "chula.ac.th") {
		return "", 400, errors.New("email not allow")
	}

	userID, code, err := us.Model.Callback(email, name, picture)
	if err != nil {
		return "", code, err
	}

	nameParts := strings.Fields(name)
	firstname := ""
	lastname := ""
	if len(nameParts) > 0 {
		firstname = nameParts[0]
	}
	if len(nameParts) > 1 {
		lastname = nameParts[len(nameParts)-1]
	}
	role := ""
	if strings.HasSuffix(email, "@student.chula.ac.th") {
		role = "student"
	} else if strings.HasSuffix(email, "@chula.ac.th") {
		role = "teacher"
	}
	claims := jwt.MapClaims{
		"firstname": firstname,
		"lastname":  lastname,
		"email":     email,
		"user_id":   userID,
		"profile":   picture,
		"role":      role,
		"exp":       time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(us.JWT_Key)
	if err != nil {
		return "", 500, err
	}

	tokenString = "Bearer " + tokenString

	return tokenString, 200, nil
}
