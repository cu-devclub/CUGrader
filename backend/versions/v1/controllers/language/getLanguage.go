package language

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (lc *LanguageController) GetLanguagesHandler(c *gin.Context) {
	languages, err := lc.Service.GetLanguages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "internal error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"languages": languages,
	})
}
