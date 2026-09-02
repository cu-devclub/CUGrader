package v1

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
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
	_ = godotenv.Load()

	var clientID, clientSecret, redirectURI string

	// Check if client_secrets.json exists, otherwise fall back to environment variables
	if file, err := os.Open("client_secrets.json"); err == nil {
		defer file.Close()
		config := struct {
			Web struct {
				ClientID     string   `json:"client_id"`
				ClientSecret string   `json:"client_secret"`
				RedirectURIs []string `json:"redirect_uris"`
			} `json:"web"`
		}{}
		if err := json.NewDecoder(file).Decode(&config); err == nil {
			clientID = config.Web.ClientID
			clientSecret = config.Web.ClientSecret
			if len(config.Web.RedirectURIs) > 0 {
				redirectURI = config.Web.RedirectURIs[0]
			}
		}
	}

	if clientID == "" {
		clientID = os.Getenv("GOOGLE_CLIENT_ID")
	}
	if clientSecret == "" {
		clientSecret = os.Getenv("GOOGLE_CLIENT_SECRET")
	}
	if redirectURI == "" {
		redirectURI = os.Getenv("GOOGLE_REDIRECT_URI")
	}

	googleOauthConfig := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURI,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	pubKeyPEM := os.Getenv("PUBLIC_KEY")
	var rsaPub *rsa.PublicKey
	if pubKeyPEM != "" {
		block, _ := pem.Decode([]byte(pubKeyPEM))
		if block != nil {
			if pub, err := x509.ParsePKIXPublicKey(block.Bytes); err == nil {
				if key, ok := pub.(*rsa.PublicKey); ok {
					rsaPub = key
				}
			} else if key, err := x509.ParsePKCS1PublicKey(block.Bytes); err == nil {
				rsaPub = key
			}
		}
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
