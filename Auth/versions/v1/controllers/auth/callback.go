package auth

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (ac *AuthController) Callback(c *gin.Context) {
	session := sessions.Default(c)
	retrievedState := session.Get("state")

	encodedCiphertext, err := ac.Service.Callback(c.Query("state"), c.Query("code"), retrievedState)
	if err != nil {
		fmt.Println("Error during callback:", err)
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/", os.Getenv("FRONTEND_URL")))
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/callback?credential=%s", os.Getenv("FRONTEND_URL"), encodedCiphertext))
}
