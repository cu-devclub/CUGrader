package config

import (
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
	JWT_key = []byte(os.Getenv("JWT_KEY"))
	Is_dev = os.Getenv("SERVICE_ENV") == "development"
	privKey, err := loadPrivateKeyFromEnv()
	if err != nil {
		log.Fatalf("Failed to load private key: %v", err)
	}
	PrivKey = privKey

	Path = os.Getenv("FILES_PATH")

	if MongoURI == "" || RabbitURI == "" || YSQLDSN == "" {
		log.Fatal("Missing one or more required environment variables")
	}
}

func loadPrivateKeyFromEnv() (*rsa.PrivateKey, error) {
	privKeyPEM := os.Getenv("PRIVATE_KEY")
	block, _ := pem.Decode([]byte(privKeyPEM))
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the private key")
	}
	privKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return privKey, nil
}
