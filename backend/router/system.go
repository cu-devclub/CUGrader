package router

import (
	"cugrader/controller/system"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) GetSystemSupportedLanguage(c *gin.Context) {
	system.GetLanguagesHandler(c)
}

func (s *Server) TestPing(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Pong!"})
}
