package config

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	MongoURI  string
	RabbitURI string
	YSQLDSN   string
	JWT_key   []byte
	Port      string
	Is_dev    bool
	PrivKey   *rsa.PrivateKey
	Path      string
)

func LoadEnv() {
	_ = godotenv.Load()

	MongoURI = os.Getenv("MONGO_URI")
	RabbitURI = os.Getenv("RABBIT_URI")
	YSQLDSN = os.Getenv("YSQL_DSN")
	
	jwtSecret := os.Getenv("JWT_KEY")
	if jwtSecret == "" {
		jwtSecret = "cugrader-default-jwt-secret-key-32chars!"
	}
	JWT_key = []byte(jwtSecret)
	
	Port = os.Getenv("PORT")
	if Port == "" {
		Port = "5000"
	}

	Is_dev = os.Getenv("SERVICE_ENV") == "development" || os.Getenv("SERVICE_ENV") == ""

	Path = os.Getenv("FILES_PATH")
	if Path == "" {
		Path = "temp"
	}
	_ = os.MkdirAll(Path, 0755)

	privKey, err := loadPrivateKeyFromEnv()
	if err != nil {
		log.Printf("Warning: private key not loaded: %v", err)
	}
	PrivKey = privKey

	if MongoURI == "" || RabbitURI == "" || YSQLDSN == "" {
		log.Println("Note: One or more database/queue URIs not set in environment, will use defaults or wait for env configuration")
	}
}

func loadPrivateKeyFromEnv() (*rsa.PrivateKey, error) {
	privKeyPEM := os.Getenv("PRIVATE_KEY")
	if privKeyPEM == "" {
		if Is_dev {
			log.Println("Notice: No PRIVATE_KEY provided in development mode, generating ephemeral RSA key")
			return rsa.GenerateKey(rand.Reader, 2048)
		}
		return nil, errors.New("missing PRIVATE_KEY environment variable")
	}
	block, _ := pem.Decode([]byte(privKeyPEM))
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the private key")
	}
	if privKey, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return privKey, nil
	}
	parsedKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err == nil {
		if privKey, ok := parsedKey.(*rsa.PrivateKey); ok {
			return privKey, nil
		}
	}
	return nil, errors.New("failed to parse private key as PKCS1 or PKCS8")
}
