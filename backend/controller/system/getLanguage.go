package system

import (
	"cugrader/logic/system"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetLanguagesHandler(c *gin.Context) {
	languages, err := system.GetLanguages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "internal error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"languages": languages,
	})
}
