package auth

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (ac *AuthController) Login(c *gin.Context) {

	state, url := ac.Service.Login()

	session := sessions.Default(c)
	session.Set("state", state)
	session.Save()

	c.Redirect(http.StatusTemporaryRedirect, url)
}
