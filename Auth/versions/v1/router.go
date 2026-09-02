package v1

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	authController "CUGrader/Auth/versions/v1/controllers/auth"
	authModel "CUGrader/Auth/versions/v1/models/auth"
	authService "CUGrader/Auth/versions/v1/services/auth"
)

var googleOauth *oauth2.Config
var RSAPublicKey *rsa.PublicKey

func initGoogleOauth() (*oauth2.Config, *rsa.PublicKey) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	file, err := os.Open("client_secrets.json")
	if err != nil {
		log.Fatalf("Unable to open credentials file: %v", err)
	}
	defer file.Close()

	config := struct {
		Web struct {
			ClientID     string   `json:"client_id"`
			ClientSecret string   `json:"client_secret"`
			RedirectURIs []string `json:"redirect_uris"`
		} `json:"web"`
	}{}

	if err := json.NewDecoder(file).Decode(&config); err != nil {
		log.Fatalf("Unable to parse credentials file: %v", err)
	}

	// Log the web client secret to the console
	fmt.Println("Web Client Secret:", config.Web.ClientSecret)

	googleOauthConfig := &oauth2.Config{
		ClientID:     config.Web.ClientID,
		ClientSecret: config.Web.ClientSecret,
		RedirectURL:  config.Web.RedirectURIs[0],
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	block, _ := pem.Decode([]byte(os.Getenv("PUBLIC_KEY")))
	if block == nil || block.Type != "PUBLIC KEY" {
		log.Fatal("Failed to decode PEM block containing public key")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		log.Fatalf("Unable to parse RSA public key: %v", err)
	}

	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		log.Fatal("Not RSA public key")
	}

	return googleOauthConfig, rsaPub
}

func RegisterRoutes(r *gin.RouterGroup) {
	googleOauth, RSAPublicKey = initGoogleOauth()

	authModel := &authModel.AuthModel{GoogleOauth: googleOauth, RSAPublicKey: RSAPublicKey}
	authService := &authService.AuthService{Model: authModel}
	authController := &authController.AuthController{Service: authService}

	r.GET("/login", authController.Login)
	r.GET("/callback", authController.Callback)
}
